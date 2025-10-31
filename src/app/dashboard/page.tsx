"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

interface DashboardMetrics {
  workDemand: number;
  wagePayments: number;
  completionRate: number;
  activeWorkers: number;
  totalProjects: number;
  completedProjects: number;
  ongoingProjects: number;
  totalWorkers: number;
  activeJobCards: number;
  workerEngagementRate: number;
  avgWagePerWorker: number;
}

interface HistoricalData {
  month: string;
  workDemand: number;
  wagePayments: number;
  completionRate: number;
  activeWorkers?: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function WorkerEngagementChart({ metrics }: { metrics: DashboardMetrics }) {
  const activeWorkers = metrics.activeWorkers || 0;
  const totalWorkers = metrics.totalWorkers || 0;
  const inactiveWorkers = Math.max(0, totalWorkers - activeWorkers);

  const pieData = [
    { name: "Active Workers", value: activeWorkers, color: "#10b981" },
    { name: "Inactive Workers", value: inactiveWorkers, color: "#94a3b8" },
  ];

  const renderLabel = (entry: any) => {
    const percentage = totalWorkers > 0 ? ((entry.value / totalWorkers) * 100).toFixed(1) : "0.0";
    return `${entry.name}: ${percentage}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [value.toLocaleString("en-IN") + " workers", ""]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function MultiMetricTrendChart({ data }: { data: HistoricalData[] }) {
  if (data.length === 0) return null;

  const chartData = data.map(record => ({
    month: record.month.substring(0, 3),
    completion: record.completionRate,
    wages: record.wagePayments / 10000000, // Convert to Crores
    workers: record.activeWorkers ? record.activeWorkers / 1000 : 0, // Convert to thousands
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="completion"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Completion %"
          dot={{ r: 4 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="wages"
          stroke="#10b981"
          strokeWidth={2}
          name="Wages (Cr)"
          dot={{ r: 4 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="workers"
          stroke="#f59e0b"
          strokeWidth={2}
          name="Workers (K)"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
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
  // Calculate Job Card Activation Rate with safety checks
  const jobCardActivationRate = (metrics.totalWorkers && metrics.activeJobCards && metrics.totalWorkers > 0)
    ? ((metrics.activeJobCards / metrics.totalWorkers) * 100).toFixed(2)
    : "0";
  
  // Provide defaults for optional fields
  const safeMetrics = {
    ...metrics,
    ongoingProjects: metrics.ongoingProjects ?? (metrics.totalProjects - metrics.completedProjects),
    totalWorkers: metrics.totalWorkers ?? metrics.activeWorkers * 10,
    activeJobCards: metrics.activeJobCards ?? Math.floor(metrics.activeWorkers * 0.5),
    workerEngagementRate: metrics.workerEngagementRate ?? 0,
    avgWagePerWorker: metrics.avgWagePerWorker ?? (metrics.activeWorkers > 0 ? Math.floor(metrics.wagePayments / metrics.activeWorkers) : 0),
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

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
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Total Works</CardTitle>
              <CardDescription>Projects undertaken this period</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{safeMetrics.workDemand.toLocaleString("en-IN")}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {safeMetrics.activeWorkers.toLocaleString("en-IN")} active workers
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Wage Payments</CardTitle>
              <CardDescription>Total disbursed this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">{formatCurrency(safeMetrics.wagePayments)}</p>
              <p className="mt-2 text-sm text-muted-foreground">Directly to workers&apos; accounts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Implementation Progress</CardTitle>
              <CardDescription>Works actively under execution</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">{safeMetrics.completionRate}%</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {safeMetrics.completedProjects} completed, {safeMetrics.ongoingProjects} ongoing
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Worker Engagement</CardTitle>
              <CardDescription>Active workforce participation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-600">{safeMetrics.workerEngagementRate}%</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {safeMetrics.activeWorkers.toLocaleString("en-IN")} of {safeMetrics.totalWorkers.toLocaleString("en-IN")} workers
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Job Card Activation</CardTitle>
              <CardDescription>Active job cards issued</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-orange-600">{jobCardActivationRate}%</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {safeMetrics.activeJobCards.toLocaleString("en-IN")} active cards
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Avg Wage per Worker</CardTitle>
              <CardDescription>Fund utilization efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-teal-600">{formatCurrency(safeMetrics.avgWagePerWorker)}</p>
              <p className="mt-2 text-sm text-muted-foreground">Per active worker this period</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="md:col-span-2 lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Worker Engagement Distribution</CardTitle>
              <CardDescription>Active vs total registered workforce</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkerEngagementChart metrics={safeMetrics} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Work Summary</CardTitle>
              <CardDescription>Current implementation status</CardDescription>
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
                  {metrics.ongoingProjects}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Workers</span>
                <span className="text-lg font-semibold">
                  {metrics.totalWorkers.toLocaleString("en-IN")}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="md:col-span-2 lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>Multi-Metric Performance Trend</CardTitle>
              <CardDescription>Track completion rate, wage payments, and active workers over time</CardDescription>
            </CardHeader>
            <CardContent>
              <MultiMetricTrendChart data={history} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const districtCode = searchParams.get('district');
  const districtName = searchParams.get('name') || districtCode || "Unknown";

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [history, setHistory] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!districtCode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const [dashboardRes, historyRes] = await Promise.all([
          fetch(`/api/dashboard?district=${districtCode}`),
          fetch(`/api/history?district=${districtCode}`)
        ]);

        if (!dashboardRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const dashboardData = await dashboardRes.json();
        const historyData = historyRes.ok ? await historyRes.json() : { history: [] };

        setMetrics(dashboardData.metrics);
        setHistory(historyData.history || []);
      } catch (err) {
        console.error('Data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [districtCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (metrics) {
    return <MetricsDisplay metrics={metrics} districtName={districtName} history={history} />;
  }

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
          <p className="mt-2 text-lg text-destructive">
            {districtCode ? "Unable to load data for this district" : "Please select a district to view data"}
          </p>
        </div>
        <ThemeToggle />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>
            {error || (districtCode
              ? "Data for this district is not available yet."
              : "Go back and select a district to view its MGNREGA metrics.")}
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        )}
      </Card>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6 py-12">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg text-muted-foreground">Loading...</p>
            </div>
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </div>
    </main>
  );
}