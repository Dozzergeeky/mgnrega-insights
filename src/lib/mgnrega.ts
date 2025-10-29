import { env } from "@/lib/env";

export type MgnregaMonthlyRecord = Record<string, unknown> & {
  district?: string;
  state?: string;
  fin_year?: string;
  month?: string;
};

export interface FetchMonthlyParams {
  districtCode: string;
  year: number;
  month: number;
  additionalFilters?: Record<string, string>;
}

interface DataGovResponse<T> {
  success?: boolean;
  message?: string;
  total?: number;
  count?: number;
  records: T[];
}

function assertApiConfig() {
  if (!env.MGNREGA_API_KEY || !env.MGNREGA_RESOURCE_ID) {
    throw new Error(
      "MGNREGA_API_KEY and MGNREGA_RESOURCE_ID must be configured to call the data.gov.in API"
    );
  }
}

function buildQueryUrl(resourceId: string) {
  const trimmed = resourceId.replace(/\/+$/, "");
  return new URL(`${env.MGNREGA_BASE_URL}/${trimmed}`);
}

export function formatPeriod(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export async function fetchMonthlyDistrictPerformance<TRecord = MgnregaMonthlyRecord>(
  params: FetchMonthlyParams
): Promise<TRecord[]> {
  assertApiConfig();

  const { districtCode, month, year, additionalFilters = {} } = params;
  const url = buildQueryUrl(env.MGNREGA_RESOURCE_ID!);

  url.searchParams.set("api-key", env.MGNREGA_API_KEY!);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(env.MGNREGA_PAGE_SIZE));
  url.searchParams.set("offset", "0");

  // Map month number to month name (API uses "Jan", "Feb", etc.)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = monthNames[month - 1];

  const filters: Record<string, string> = {
    state_name: "WEST BENGAL",
    district_code: districtCode,
    fin_year: `${year}-${year + 1}`,
    month: monthName,
    ...additionalFilters,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(`filters[${key}]`, value);
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch MGNREGA data (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as DataGovResponse<TRecord>;

  if (payload.success === false) {
    throw new Error(`MGNREGA API responded with an error: ${payload.message ?? "unknown"}`);
  }

  return payload.records ?? [];
}
