export const apiLogMessage = (
  operation: "GET" | "POST" | "DELETE" | "PATCH",
  type: string,
  value?: string,
  isError = false,
  errorMessage?: string
) => {
  let action =
    operation === "GET"
      ? "retrieve"
      : operation === "POST"
      ? "add"
      : operation === "DELETE"
      ? "remove"
      : operation === "PATCH"
      ? "update"
      : "";
  if (!isError) {
    action += action.endsWith("e") ? "d" : "ed";
  }
  return `${isError ? "couldn't " : ""}${action} ${type}${
    value ? " '" + value + "'" : ""
  } information${errorMessage ? " - error message:" + errorMessage : ""}`;
};

export const mapLogsMessage = (
  type: "load" | "area-select" | "layer-change" | "map-search",
  errorType = "" as "" | "error" | "warning",
  extra?: string
) => {
  let action = "";
  if (errorType === "error") {
    action =
      type === "load"
        ? "load"
        : type === "area-select"
        ? "select an area in"
        : type === "layer-change"
        ? "chang a layer in"
        : type === "map-search"
        ? "search"
        : "";
  }
  if (errorType === "warning") {
    action =
      type === "load"
        ? "load"
        : type === "area-select"
        ? "select an area in"
        : type === "layer-change"
        ? "chang a layer in"
        : type === "map-search"
        ? `find the search '${extra}' in`
        : "";
  } else {
    action =
      type === "load"
        ? "loaded"
        : type === "area-select"
        ? "selected an area in"
        : type === "layer-change"
        ? "changed a layer in"
        : type === "map-search"
        ? "searched"
        : "";
  }
  return `${errorType ? "couldn't " : "has "}${action} the map ${
    !errorType ? "successfully" : ""
  }`;
};
