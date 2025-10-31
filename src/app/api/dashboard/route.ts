import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { isDataGovRecord, sumField } from "@/lib/data-gov";

export const dynamic = "force-dynamic";

// Generate realistic mock data based on actual MGNREGA patterns
function generateMockMetrics(districtCode: string) {
  const seed = districtCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomFactor = (seed % 100) / 100;
  
  // Based on actual West Bengal MGNREGA data (FY 2024-25)
  const baseWorkDemand = 120000 + Math.floor(randomFactor * 80000); // 120K-200K person-days
  const baseWagePayments = 18000000 + Math.floor(randomFactor * 15000000); // ₹18-33 Cr
  const completionRate = 65 + Math.floor(randomFactor * 25); // 65-90%
  const activeWorkers = 8000 + Math.floor(randomFactor * 7000); // 8K-15K workers
  const totalProjects = 300 + Math.floor(randomFactor * 250); // 300-550 projects
  const completedProjects = Math.floor(totalProjects * (completionRate / 100));
  const ongoingProjects = totalProjects - completedProjects;
  const totalWorkers = Math.floor(activeWorkers * 10); // Total registered workers
  const activeJobCards = Math.floor(activeWorkers * 0.5); // ~50% of active workers have active cards
  const workerEngagementRate = ((activeWorkers / totalWorkers) * 100).toFixed(2);
  const avgWagePerWorker = Math.floor(baseWagePayments / activeWorkers);

  return {
    workDemand: baseWorkDemand,
    wagePayments: baseWagePayments,
    completionRate: Math.round(completionRate * 10) / 10,
    activeWorkers,
    totalProjects,
    completedProjects,
    ongoingProjects,
    totalWorkers,
    activeJobCards,
    workerEngagementRate: parseFloat(workerEngagementRate),
    avgWagePerWorker,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtCode = searchParams.get("district");

    if (!districtCode) {
      return NextResponse.json({ error: "District code is required" }, { status: 400 });
    }

    const db = await getMongoDb();
    const metricsCollection = db.collection("district_metrics");

    // Fetch the most recent record for this district
    const record = await metricsCollection
      .findOne({ districtCode }, { sort: { lastSyncedAt: -1, period: -1 } });

    if (record && Array.isArray(record.records) && record.records.length > 0) {
      const dataGovRecords = record.records.filter(isDataGovRecord);

      if (dataGovRecords.length > 0) {
        // Use Total_Exp (in lakhs) and convert to rupees
        const totalExpLakhs = sumField(dataGovRecords, "Total_Exp");
        console.log(`[Dashboard API] District ${districtCode}: Total_Exp lakhs = ${totalExpLakhs}, records = ${dataGovRecords.length}`);
        const wagePayments = totalExpLakhs * 100000; // Convert lakhs to rupees
        const worksCompleted = sumField(dataGovRecords, "Number_of_Completed_Works");
        const worksOngoing = sumField(dataGovRecords, "Number_of_Ongoing_Works");
        const worksTakenUp = sumField(dataGovRecords, "Total_No_of_Works_Takenup");
        const activeWorkers = sumField(dataGovRecords, "Total_No_of_Active_Workers");
        const totalWorkers = sumField(dataGovRecords, "Total_No_of_Workers");
        const activeJobCards = sumField(dataGovRecords, "Total_No_of_Active_Job_Cards");

        const totalProjects = worksCompleted + worksOngoing;
        // Use totalProjects as the metric instead of person-days (which are often 0 in the API)
        const workDemand = totalProjects;
        
        // Calculate Work Progress Rate: percentage of active works (completed + ongoing) out of total taken up
        // This shows implementation progress rather than just completion
        const completionRate = worksTakenUp > 0 
          ? ((worksCompleted + worksOngoing) / worksTakenUp) * 100 
          : 0;
        
        // Keep 2 decimal places for precision
        const formattedCompletionRate = Math.round(completionRate * 100) / 100;
        
        // Calculate additional metrics
        const workerEngagementRate = totalWorkers > 0 
          ? Math.round((activeWorkers / totalWorkers) * 10000) / 100 
          : 0;
        
        const avgWagePerWorker = activeWorkers > 0 
          ? Math.round(wagePayments / activeWorkers) 
          : 0;

        return NextResponse.json({
          districtCode,
          metrics: {
            workDemand: Math.round(workDemand),
            wagePayments: Math.round(wagePayments),
            completionRate: formattedCompletionRate,
            activeWorkers: Math.round(activeWorkers),
            totalProjects,
            completedProjects: worksCompleted,
            ongoingProjects: worksOngoing,
            totalWorkers: Math.round(totalWorkers),
            activeJobCards: Math.round(activeJobCards),
            workerEngagementRate,
            avgWagePerWorker,
          },
          lastUpdated: record.lastSyncedAt,
          source: "real_data",
          period: record.period,
        });
      }
    }

    // Return realistic mock data if no records found
    const mockMetrics = generateMockMetrics(districtCode);
    return NextResponse.json({
      districtCode,
      metrics: mockMetrics,
      lastUpdated: new Date().toISOString(),
      source: "mock_data",
      message: "Using simulated data. Run 'npm run sync:mgnrega' to fetch real data from data.gov.in",
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    
    const { searchParams } = new URL(request.url);
    const districtCode = searchParams.get("district") || "WB-KOL";
    
    // Return realistic mock data on error
    const mockMetrics = generateMockMetrics(districtCode);
    return NextResponse.json({
      districtCode,
      metrics: mockMetrics,
      lastUpdated: new Date().toISOString(),
      source: "mock_data_fallback",
      message: "Database unavailable. Showing simulated data.",
    });
  }
}
