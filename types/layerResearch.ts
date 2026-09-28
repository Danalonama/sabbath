type PotentialItem = {
  title?: string;
  count: string;
  units?: string;
  percent: string;
};

export type BlocStat = {
  color: string;
  label: string;
  count?: string;
  percent?: string;
};

export type BlocRow = {
  title: string;
  data: BlocStat[];
};

type CollapseItem = {
  leaning?: string;
  value?: string;
  potential?: PotentialItem[];
  dataTitle: string;
  statZoneColor: boolean;
  dataRows: BlocRow[];
  attributes?: BlocStat[];
};

export type CompassItems = Record<string, CollapseItem>;

export type StatAttribute = {
  color: string,
  label: string,
  value: JSX.Element,
};
