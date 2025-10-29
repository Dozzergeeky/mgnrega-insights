import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardMetrics {
  workDemand: number;
  wagePayments: number;
  completionRate: number;
  activeWorkers: number;
  totalProjects: number;
  completedProjects: number;
}

interface HistoricalData {
  month: string;
  workDemand: number;
  wagePayments: number;
  completionRate: number;
  activeWorkers?: number;
}

async function fetchDashboardData(districtCode: string): Promise<DashboardMetrics | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/dashboard?district=${districtCode}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.metrics;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return null;
  }
}

async function fetchHistoricalData(districtCode: string): Promise<HistoricalData[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/history?district=${districtCode}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error("Failed to fetch historical data:", error);
    return [];
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function SimpleTrendChart({ data }: { data: HistoricalData[] }) {
  if (data.length === 0) return null;

  const maxCompletion = Math.max(...data.map(d => d.completionRate), 1);
  
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">6-Month Completion Trend</p>
      <div className="flex items-end justify-between gap-2 h-40 px-2">
        {data.slice(-6).map((record, idx) => {
          const height = Math.max((record.completionRate / maxCompletion) * 100, 5);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end" style={{ height: "120px" }}>
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500" 
                  style={{ height: `${height}%`, minHeight: "8px" }}
                  title={`${record.month}: ${record.completionRate}%`}
                />
              </div>
              <span className="text-xs text-muted-foreground text-center">
                {record.month.substring(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-2">
        <span>0%</span>
        <span>{Math.round(maxCompletion)}%</span>
      </div>
    </div>
  );
}

function MetricsDisplay({ 
  metrics, 
  districtName,
  history 
}: { 
  metrics: DashboardMetrics; 
  districtName: string;
  history: HistoricalData[];
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                ← Back
              </Button>
            </Link>
            <h1 className="text-4xl font-bold">MGNREGA Dashboard</h1>
          </div>
          <p className="mt-2 text-lg text-muted-foreground">
            District: <span className="font-semibold text-foreground">{districtName}</span>
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Work Demand</CardTitle>
            <CardDescription>Job cards issued this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{metrics.workDemand.toLocaleString("en-IN")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {metrics.activeWorkers.toLocaleString("en-IN")} active workers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wage Payments</CardTitle>
            <CardDescription>Total disbursed this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{formatCurrency(metrics.wagePayments)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Directly to workers&apos; accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Overall project completion</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{metrics.completionRate}%</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {metrics.completedProjects} of {metrics.totalProjects} projects done
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Work Summary</CardTitle>
            <CardDescription>Current status of MGNREGA implementation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">Total Projects</span>
              <span className="text-lg font-semibold">{metrics.totalProjects}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">Completed Projects</span>
              <span className="text-lg font-semibold text-green-600">{metrics.completedProjects}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">In Progress</span>
              <span className="text-lg font-semibold text-blue-600">
                {metrics.totalProjects - metrics.completedProjects}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Wage per Worker</span>
              <span className="text-lg font-semibold">
                {formatCurrency(metrics.activeWorkers > 0 ? metrics.wagePayments / metrics.activeWorkers : 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>How your district has performed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleTrendChart data={history} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string; name?: string }>;
}) {
  const params = await searchParams;
  const districtCode = params.district;
  const districtName = params.name || districtCode || "Unknown";

  let metrics: DashboardMetrics | null = null;
  let history: HistoricalData[] = [];

  if (districtCode) {
    [metrics, history] = await Promise.all([
      fetchDashboardData(districtCode),
      fetchHistoricalData(districtCode),
    ]);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6 py-12">
        {metrics ? (
          <Suspense fallback={<div>Loading dashboard...</div>}>
            <MetricsDisplay metrics={metrics} districtName={districtName} history={history} />
          </Suspense>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold">MGNREGA Dashboard</h1>
              <p className="mt-2 text-lg text-destructive">
                {districtCode ? "Unable to load data for this district" : "Please select a district to view data"}
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>No Data Available</CardTitle>
                <CardDescription>
                  {districtCode
                    ? "Data for this district is not available yet."
                    : "Go back and select a district to view its MGNREGA metrics."}
                </CardDescription>
              </CardHeader>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}