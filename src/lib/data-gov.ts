export type DataGovRecord = {
  Persondays_of_Central_Liability_so_far?: string | number | null;
  Wages?: string | number | null;
  Number_of_Completed_Works?: string | number | null;
  Number_of_Ongoing_Works?: string | number | null;
  Total_No_of_Active_Workers?: string | number | null;
};

const numericKeys = [
  "Persondays_of_Central_Liability_so_far",
  "Wages",
  "Number_of_Completed_Works",
  "Number_of_Ongoing_Works",
  "Total_No_of_Active_Workers",
] as const;

export type NumericField = (typeof numericKeys)[number];

const toNumber = (value: DataGovRecord[NumericField]): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const sumField = (rows: DataGovRecord[], field: NumericField): number =>
  rows.reduce((total, row) => total + toNumber(row[field]), 0);

export const isDataGovRecord = (candidate: unknown): candidate is DataGovRecord => {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  const record = candidate as Record<string, unknown>;
  return numericKeys.some((key) => key in record);
};
