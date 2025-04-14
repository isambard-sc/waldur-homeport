export interface Period {
  month: number;
  year: number;
}

export interface Usage extends Period {
  node_usage: number;
}
