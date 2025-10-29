export interface MGNREGARecord {
  districtCode: string;
  districtName: string;
  stateCode: string;
  stateName: string;
  recordDate: Date;
  workDemand: number;
  wagePayments: number;
  completionRate: number;
  activeWorkers: number;
  totalProjects: number;
  completedProjects: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistrictComparative {
  currentMonth: MGNREGARecord;
  previousMonth: MGNREGARecord | null;
  stateAverage: {
    workDemand: number;
    wagePayments: number;
    completionRate: number;
  };
  trend: "improving" | "declining" | "stable";
}
