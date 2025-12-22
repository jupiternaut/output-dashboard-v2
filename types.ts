export interface ConstructionData {
  id: string;
  date: string; // Format: "YYYY-MM"
  month: number;
  store: string; // 门店
  city: string; // 城市
  transferSites: number; // 转单工地
  totalOutputValue: number; // 总产值(万)
  pendingStartSites: number; // 待开工工地
  pendingStartOutput: number; // 待开工产值(万)
  underConstructionSites: number; // 在建工地
  underConstructionOutput: number; // 在建产值(万)
  completedSites: number; // 完工工地
  completedOutput: number; // 完工产值(万)
  receivedEngineering: number; // 已收工程款
  unpaidEngineering: number; // 未收工程款
  paidWorker: number; // 已付工人
  paidForeman: number; // 已付工长
  payableMaterial: number; // 应付材料款
  paidMaterial: number; // 已付材料款
  unpaidMaterial: number; // 未付材料款
  managerBonus: number; // 项目经理发
  payableManager: number; // 应付项目经理
  received: number; // 已收
  unpaid: number; // 未付
  totalGrossProfit: number; // 总毛利
}

export interface FilterState {
  city: string;
  store: string;
  month: string;
}

export interface MetricSummary {
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number;
}
