#!/usr/bin/env python3
import datetime
import json
import math
import re
import shutil
import subprocess
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from pyspark.sql import SparkSession
from pyspark.sql import functions as F


timestamp = datetime.datetime.now().strftime("%Y-%m-%d-%H%M%S")

CATALOG = "campaigner"
SCHEMA = "maps_kalpi"
DB_SCHEMA = "maps_dev"

ID_COLUMN = "city_cluster_code"
SHARED_TABLE = "clusters_data"
ORG_TABLE_PREFIX = "kalpi_clusters_"

BASE_MATCH_COLUMN = "location"
GEOJSON_MATCH_PROPERTY = "place"

VOLUME_PATH = "/Volumes/campaigner/maps_kalpi/kalpi"
RESULTS_PATH = f"{VOLUME_PATH}/results"
GEOJSON_INPUT_PATH = f"{VOLUME_PATH}/base/kalpi_locations.json"
GEOJSON_OUTPUT_PATH = (
    f"{RESULTS_PATH}/geojson/kalpi_locations_enriched_{timestamp}.geojson"
)
LDGEOJSON_OUTPUT_PATH = (
    f"{RESULTS_PATH}/ldgeojson/kalpi_locations_enriched_{timestamp}.ldgeojson.ld"
)
STAGING_OUTPUT_PATH = (
    f"{RESULTS_PATH}/staging/kalpi_locations_enriched.ldgeojson.ld"
)
OUTPUT_TABLE = "kalpi_locations_enriched"
KALPIS_LAYER_TABLE = "kalpis_layer"

# Fill this with the orgs you want to expose in the app table.
# `key` is the prefix added to columns from kalpi_clusters_<org>, for example DEMO.
# Example:
# ORG_CONFIGS = [
#     {"org_id": "org_123", "key": "DEMO"},
# ]
ORG_CONFIGS: List[Dict[str, str]] = [
    {"org_id": "org_2vUYBdP1j3DEMoxOC5gile0HInb", "key": "DEMO"},
]

MAPBOX_USERNAME = "agam-integration"
# Must match the source in the Mapbox tileset recipe:
# mapbox://tileset-source/agam-integration/kalpi_mts
MAPBOX_SOURCE_ID = "kalpi_mts"
MAPBOX_TILESET_ID = "agam-integration.kalpi_location_mts"

MAPBOX_SECRET_SCOPE = "campaigner"
MAPBOX_SECRET_KEY = "MAPBOX_ACCESS_TOKEN"
MAPBOX_JOB_POLL_SECONDS = 20
MAPBOX_JOB_MAX_POLLS = 30


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


def is_nullish(value: Any) -> bool:
    if value is None:
        return True
    try:
        if pd.isna(value):
            return True
    except Exception:
        pass
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return True
    if isinstance(value, str) and value.strip().lower() in {"", "nan", "null"}:
        return True
    return False


def normalize_key(value: Any) -> Optional[str]:
    if is_nullish(value):
        return None
    return str(value).strip()


def build_column_type_map_from_spark(sdf, skip_columns: Optional[set] = None):
    column_type_map = {}
    skip_columns = skip_columns or set()

    for field in sdf.schema.fields:
        col = field.name
        if col in skip_columns:
            continue

        dtype = field.dataType.simpleString().lower()
        if dtype in {"bigint", "int", "smallint", "tinyint", "long", "short"}:
            column_type_map[col] = "int"
        elif dtype in {"float", "double", "decimal"} or dtype.startswith("decimal"):
            column_type_map[col] = "float"
        elif dtype == "boolean":
            column_type_map[col] = "bool"
        else:
            column_type_map[col] = "other"

    return column_type_map


def normalize_json_value(value, col=None, column_type_map=None):
    if is_nullish(value):
        return None

    col_type = None
    if column_type_map and col is not None:
        col_type = column_type_map.get(col)

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, (np.floating, float)):
        if math.isnan(value) or math.isinf(value):
            return None
        if col_type == "int":
            return int(value)
        return float(value)

    return value


def safe_org_prefix(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]+", "_", value).strip("_").upper()


def prefixed_column(prefix: Optional[str], column: str) -> str:
    if not prefix:
        return column
    prefix = safe_org_prefix(prefix)
    if column.upper().startswith(f"{prefix}_"):
        return column
    return f"{prefix}_{column}"


def list_source_tables(spark: SparkSession) -> List[str]:
    tables_df = spark.sql(f"SHOW TABLES IN {CATALOG}.{SCHEMA}")
    rows = tables_df.collect()
    return [
        f"{CATALOG}.{SCHEMA}.{row.tableName}"
        for row in rows
        if not row.isTemporary
    ]


def table_to_lookup(
    spark: SparkSession,
    full_table_name: str,
    key_column: str,
    output_prefix: Optional[str] = None,
    skip_output_columns: Optional[set] = None,
    include_key_column: bool = False,
) -> Dict[str, Dict[str, Any]]:
    sdf = spark.table(full_table_name)
    skip_output_columns = skip_output_columns or set()
    column_type_map = build_column_type_map_from_spark(sdf, {key_column})

    if key_column not in sdf.columns:
        print(f"Skipping {full_table_name}: missing {key_column}")
        return {}

    sdf = sdf.dropDuplicates([key_column])
    pdf = sdf.toPandas()

    if pdf.empty:
        return {}

    pdf[key_column] = pdf[key_column].map(normalize_key)
    pdf = pdf[pdf[key_column].notna()]
    pdf = pdf.set_index(key_column)

    lookup: Dict[str, Dict[str, Any]] = {}
    columns = list(pdf.columns)

    for row in pdf.itertuples(index=True, name=None):
        idx = row[0]
        values = row[1:]
        props: Dict[str, Any] = {}

        if include_key_column:
            props[prefixed_column(output_prefix, key_column)] = idx

        for col, value in zip(columns, values):
            if col in skip_output_columns:
                continue
            if col == key_column and not include_key_column:
                continue

            value = normalize_json_value(value, col, column_type_map)
            if value is None:
                continue
            props[prefixed_column(output_prefix, col)] = value

        lookup[idx] = props

    print(f"Loaded {full_table_name}: {len(lookup):,} ids")
    return lookup


def discover_geojson_input(base_dir: str, explicit_path: Optional[str]) -> str:
    if explicit_path:
        return explicit_path

    candidates = sorted(Path(base_dir).glob("*.json"))
    if not candidates:
        raise FileNotFoundError(f"No .json file found in {base_dir}")
    if len(candidates) > 1:
        print(
            f"Found multiple JSON files in {base_dir}; using {candidates[0].name}. "
            "Set GEOJSON_INPUT_PATH to choose explicitly."
        )
    return str(candidates[0])


def build_lookups(spark: SparkSession) -> Dict[str, Any]:
    table_names = list_source_tables(spark)
    short_to_full = {name.split(".")[-1]: name for name in table_names}

    shared_full_table_name = short_to_full.get(SHARED_TABLE)
    if not shared_full_table_name:
        raise RuntimeError(f"Missing required table {CATALOG}.{SCHEMA}.{SHARED_TABLE}")

    shared_by_location = table_to_lookup(
        spark,
        shared_full_table_name,
        key_column=BASE_MATCH_COLUMN,
        include_key_column=True,
    )

    org_lookups: List[Dict[str, Dict[str, Any]]] = []
    for short_name, full_table_name in sorted(short_to_full.items()):
        if not short_name.startswith(ORG_TABLE_PREFIX):
            continue

        org_name = short_name.replace(ORG_TABLE_PREFIX, "", 1)
        org_prefix = safe_org_prefix(org_name)
        lookup = table_to_lookup(
            spark,
            full_table_name,
            key_column=ID_COLUMN,
            output_prefix=org_prefix,
            skip_output_columns={ID_COLUMN},
        )
        if lookup:
            org_lookups.append(lookup)

    print(f"Loaded {len(org_lookups):,} org-specific kalpi table(s)")
    return {
        "shared_by_location": shared_by_location,
        "org_lookups": org_lookups,
    }


def update_feature_properties(feature: Dict[str, Any], lookups: Dict[str, Any]):
    props = feature.setdefault("properties", {})
    location = normalize_key(props.get(GEOJSON_MATCH_PROPERTY))
    if location is None:
        return

    shared_row = lookups["shared_by_location"].get(location)
    if not shared_row:
        return

    city_cluster_code = normalize_key(shared_row.get(ID_COLUMN))
    if city_cluster_code is None:
        return

    props["id"] = city_cluster_code
    props[ID_COLUMN] = city_cluster_code

    for key, value in shared_row.items():
        if is_nullish(value):
            continue
        props[key] = value

    for lookup in lookups["org_lookups"]:
        row = lookup.get(city_cluster_code)
        if not row:
            continue
        for key, value in row.items():
            if is_nullish(value):
                continue
            props[key] = value


def convert_geojson_to_ldgeojson(input_path: str, output_path: str) -> None:
    if shutil.which("ogr2ogr") is None:
        raise RuntimeError(
            "ogr2ogr is not installed on this cluster. "
            "Install GDAL with an init script or use a custom container."
        )

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ogr2ogr",
        "-f",
        "GeoJSONSeq",
        output_path,
        input_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(
            f"ogr2ogr failed\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
        )


def copy_files(input_path: str, output_path: str) -> None:
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(input_path, output_path)


def upload_to_mapbox(file_path: str) -> None:
    token = dbutils.secrets.get(scope=MAPBOX_SECRET_SCOPE, key=MAPBOX_SECRET_KEY)

    cmd = [
        "curl",
        "-X",
        "PUT",
        f"https://api.mapbox.com/tilesets/v1/sources/{MAPBOX_USERNAME}/{MAPBOX_SOURCE_ID}?access_token={token}",
        "-F",
        f"file=@{file_path}",
        "--header",
        "Content-Type: multipart/form-data",
        "--fail",
        "--silent",
        "--show-error",
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Mapbox source upload failed:\n{result.stderr}")

    if result.stdout:
        print(f"Mapbox source upload response: {result.stdout}")
    print(f"Mapbox source uploaded: {MAPBOX_SOURCE_ID}")


def run_mapbox_get(path: str) -> Dict[str, Any]:
    token = dbutils.secrets.get(scope=MAPBOX_SECRET_SCOPE, key=MAPBOX_SECRET_KEY)

    cmd = [
        "curl",
        f"https://api.mapbox.com/tilesets/v1/{path}?access_token={token}",
        "--fail",
        "--silent",
        "--show-error",
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Mapbox GET failed for {path}:\n{result.stderr}")

    return json.loads(result.stdout) if result.stdout else {}


def print_mapbox_recipe() -> None:
    try:
        recipe_response = run_mapbox_get(f"{MAPBOX_TILESET_ID}/recipe")
    except Exception as error:
        print(f"Could not retrieve Mapbox recipe: {error}")
        return

    recipe = recipe_response.get("recipe", recipe_response)
    print("Current Mapbox recipe:")
    print(json.dumps(recipe, ensure_ascii=False, indent=2))


def get_mapbox_job(job_id: str) -> Dict[str, Any]:
    return run_mapbox_get(f"{MAPBOX_TILESET_ID}/jobs/{job_id}")


def wait_for_mapbox_job(job_id: str) -> None:
    for attempt in range(1, MAPBOX_JOB_MAX_POLLS + 1):
        job = get_mapbox_job(job_id)
        stage = job.get("stage")
        errors = job.get("errors") or []
        warnings = job.get("warnings") or []

        print(f"Mapbox publish job {job_id}: {stage} ({attempt}/{MAPBOX_JOB_MAX_POLLS})")
        if warnings:
            print(f"Mapbox publish warnings: {json.dumps(warnings, ensure_ascii=False)}")

        if stage == "success":
            print("Mapbox tileset publish succeeded.")
            return

        if stage in {"failed", "superseded"}:
            raise RuntimeError(
                "Mapbox publish did not complete successfully:\n"
                + json.dumps(job, ensure_ascii=False, indent=2)
            )

        if errors:
            print(f"Mapbox publish errors: {json.dumps(errors, ensure_ascii=False)}")

        time.sleep(MAPBOX_JOB_POLL_SECONDS)

    print(
        f"Mapbox publish job {job_id} is still running or queued. "
        "Check Mapbox job history before assuming the tileset is updated."
    )


def publish_mapbox_tileset() -> None:
    token = dbutils.secrets.get(scope=MAPBOX_SECRET_SCOPE, key=MAPBOX_SECRET_KEY)

    cmd = [
        "curl",
        "-X",
        "POST",
        f"https://api.mapbox.com/tilesets/v1/{MAPBOX_TILESET_ID}/publish?access_token={token}",
        "--fail",
        "--silent",
        "--show-error",
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Mapbox publish failed:\n{result.stderr}")

    publish_response = json.loads(result.stdout) if result.stdout else {}
    print(f"Mapbox publish response: {json.dumps(publish_response, ensure_ascii=False)}")
    print(f"Mapbox tileset publish started: {MAPBOX_TILESET_ID}")

    job_id = publish_response.get("jobId")
    if job_id:
        wait_for_mapbox_job(job_id)


def write_geojson(data: Dict[str, Any], output_path: str) -> None:
    out_path = Path(output_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(data, ensure_ascii=False, allow_nan=False, cls=NumpyEncoder),
        encoding="utf-8",
    )
    print(f"Wrote: {output_path}")


def write_enriched_table(spark: SparkSession, data: Dict[str, Any]) -> None:
    rows = []
    for feature in data.get("features", []):
        props = feature.get("properties") or {}
        geometry = feature.get("geometry") or {}
        coordinates = geometry.get("coordinates")
        row = dict(props)
        row["geometry"] = json.dumps(geometry, ensure_ascii=False, cls=NumpyEncoder)
        row["coordinates"] = (
            json.dumps(coordinates, ensure_ascii=False, cls=NumpyEncoder)
            if coordinates is not None
            else None
        )
        rows.append(row)

    if not rows:
        print("No kalpi rows to write to table")
        return

    pdf = pd.DataFrame(rows)
    sdf = spark.createDataFrame(pdf)
    full_table_name = f"{CATALOG}.{DB_SCHEMA}.{OUTPUT_TABLE}"
    (
        sdf.write.mode("overwrite")
        .option("overwriteSchema", "true")
        .saveAsTable(full_table_name)
    )
    print(f"Wrote table: {full_table_name} ({len(rows):,} rows)")


def sql_string(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def get_org_value(props: Dict[str, Any], org_key: str, field: str) -> Any:
    prefixed = prefixed_column(org_key, field)
    if prefixed in props:
        return props[prefixed]
    return props.get(field)


def normalize_int(value: Any) -> Optional[int]:
    if is_nullish(value):
        return None
    try:
        return int(value)
    except Exception:
        return None


def build_kalpis_layer_rows(
    data: Dict[str, Any],
    org_configs: List[Dict[str, str]],
) -> List[Dict[str, Any]]:
    rows_by_key: Dict[tuple[str, str], Dict[str, Any]] = {}
    duplicate_count = 0

    for org_config in org_configs:
        org_id = normalize_key(org_config.get("org_id"))
        org_key = safe_org_prefix(
            org_config.get("key")
            or org_config.get("prefix")
            or org_config.get("table", "").replace(ORG_TABLE_PREFIX, "", 1)
        )

        if not org_id:
            raise ValueError(f"Missing org_id in org config: {org_config}")
        if not org_key:
            raise ValueError(f"Missing key/prefix/table in org config: {org_config}")

        for feature in data.get("features", []):
            props = feature.get("properties") or {}
            city_cluster_code = normalize_key(props.get(ID_COLUMN))
            if not city_cluster_code:
                continue
            row_key = (org_id, city_cluster_code)
            if row_key in rows_by_key:
                duplicate_count += 1
                continue

            geometry = feature.get("geometry") or {}
            coordinates = geometry.get("coordinates")
            rows_by_key[row_key] = {
                "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"{org_id}:{city_cluster_code}")),
                "org_id": org_id,
                "city_cluster_code": city_cluster_code,
                "location": normalize_key(props.get("location")),
                "place": normalize_key(props.get("place")),
                "statistical_zone": normalize_key(
                    get_org_value(props, org_key, "statistical_zone")
                ),
                "official_rtv": normalize_key(
                    get_org_value(props, org_key, "official_rtv")
                ),
                "fixed_rtv": normalize_key(
                    get_org_value(props, org_key, "fixed_rtv")
                ),
                "national_rank": normalize_int(
                    get_org_value(props, org_key, "national_rank")
                ),
                "potential_group": normalize_key(
                    get_org_value(props, org_key, "potential_group")
                ),
                "coordinates": (
                    json.dumps(coordinates, ensure_ascii=False, cls=NumpyEncoder)
                    if coordinates is not None
                    else None
                ),
                "properties": json.dumps(
                    props,
                    ensure_ascii=False,
                    allow_nan=False,
                    cls=NumpyEncoder,
                ),
            }

    if duplicate_count:
        print(
            f"Skipped {duplicate_count:,} duplicate kalpis_layer row(s) "
            "with the same org_id and city_cluster_code"
        )

    return list(rows_by_key.values())


def replace_kalpis_layer_org_data(
    spark: SparkSession,
    data: Dict[str, Any],
    org_configs: List[Dict[str, str]],
    schema_name: str = DB_SCHEMA,
) -> None:
    if not org_configs:
        print("No ORG_CONFIGS provided; skipping kalpis_layer update")
        return

    rows = build_kalpis_layer_rows(data, org_configs)

    org_ids = sorted({row["org_id"] for row in rows})
    if not org_ids:
        print("No kalpis_layer rows were built; skipping table update")
        return

    full_table_name = f"{CATALOG}.{schema_name}.{KALPIS_LAYER_TABLE}"
    org_id_sql = ", ".join(sql_string(org_id) for org_id in org_ids)
    spark.sql(f"DELETE FROM {full_table_name} WHERE org_id IN ({org_id_sql})")
    print(f"Deleted existing kalpis_layer rows for {len(org_ids):,} org(s)")

    pdf = pd.DataFrame(rows)
    sdf = spark.createDataFrame(pdf)
    sdf = sdf.select(
        "id",
        "org_id",
        "city_cluster_code",
        "location",
        "place",
        "statistical_zone",
        "official_rtv",
        "fixed_rtv",
        F.col("national_rank").cast("int").alias("national_rank"),
        "potential_group",
        "coordinates",
        "properties",
    )
    sdf.write.mode("append").saveAsTable(full_table_name)
    print(f"Inserted {len(rows):,} kalpis_layer rows into {full_table_name}")


def main():
    spark = SparkSession.builder.getOrCreate()
    input_path = discover_geojson_input(f"{VOLUME_PATH}/base", GEOJSON_INPUT_PATH)
    print(f"Using kalpi base GeoJSON: {input_path}")

    lookups = build_lookups(spark)

    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for feature in data.get("features", []):
        update_feature_properties(feature, lookups)

    write_enriched_table(spark, data)
    replace_kalpis_layer_org_data(spark, data, ORG_CONFIGS)
    write_geojson(data, GEOJSON_OUTPUT_PATH)
    convert_geojson_to_ldgeojson(GEOJSON_OUTPUT_PATH, LDGEOJSON_OUTPUT_PATH)
    print(f"Wrote: {LDGEOJSON_OUTPUT_PATH}")
    copy_files(LDGEOJSON_OUTPUT_PATH, STAGING_OUTPUT_PATH)
    print(f"Wrote: {STAGING_OUTPUT_PATH}")
    upload_to_mapbox(STAGING_OUTPUT_PATH)
    print_mapbox_recipe()
    publish_mapbox_tileset()


if __name__ == "__main__":
    main()
