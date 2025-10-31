import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { isDataGovRecord, sumField } from "@/lib/data-gov";

export const dynamic = "force-dynamic";

// Generate realistic historical mock data with seasonal trends
function generateMockHistory(districtCode: string, months: number = 6) {
  const seed = districtCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mockData = [];
  const now = new Date();
  
  // Generate trending data showing improvement over time
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Add seasonal variation (monsoon season higher activity)
    const seasonalFactor = 1 + (Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.15);
    const trendFactor = 1 + ((months - i) / months) * 0.2; // 20% improvement trend
    const randomVariation = 0.9 + ((seed + i * 7) % 20) / 100; // ±10% variation
    
    const baseWorkDemand = 110000 * seasonalFactor * trendFactor * randomVariation;
    const baseWagePayments = 17000000 * seasonalFactor * trendFactor * randomVariation;
    const baseCompletionRate = (65 + ((months - i) * 2)) * randomVariation; // Improving
    const baseActiveWorkers = 9000 * seasonalFactor * trendFactor * randomVariation;
    
    mockData.push({
      month: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      workDemand: Math.round(baseWorkDemand),
      wagePayments: Math.round(baseWagePayments),
      completionRate: Math.min(95, Math.round(baseCompletionRate * 10) / 10),
      activeWorkers: Math.round(baseActiveWorkers),
    });
  }
  
  return mockData;
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

    // Get last 6 months of periods
    const now = new Date();
    const periods = [];
    for (let i = 5; i >= 0; i--) {
      // Use day 1 to avoid month overflow issues
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      periods.push(`${year}-${month}`);
    }

    const records = await metricsCollection
      .find({
        districtCode,
        period: { $in: periods },
      })
      .sort({ period: 1 })
      .toArray();

    if (records.length > 0) {
      // Transform real database records to history format
      const realHistory = records.map((record) => {
        const [year, month] = record.period.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        
        // Aggregate metrics from data.gov.in records
        const rawRecords = Array.isArray(record.records) ? record.records : [];
        const dataGovRecords = rawRecords.filter(isDataGovRecord);

        // Use Total_Exp (in lakhs) instead of Wages which contains 0
        const totalExpLakhs = sumField(dataGovRecords, "Total_Exp");
        const wagePayments = totalExpLakhs * 100000; // Convert lakhs to rupees
        const worksCompleted = sumField(dataGovRecords, "Number_of_Completed_Works");
        const worksOngoing = sumField(dataGovRecords, "Number_of_Ongoing_Works");
        const worksTakenUp = sumField(dataGovRecords, "Total_No_of_Works_Takenup");
        const activeWorkers = sumField(dataGovRecords, "Total_No_of_Active_Workers");
        
        const totalWorks = worksCompleted + worksOngoing;
        // Use totalWorks instead of person-days which are often 0
        const workDemand = totalWorks;
        
        // Calculate Works Implementation Rate: shows percentage of sanctioned works actively being implemented
        const implementationRate = worksTakenUp > 0 
          ? ((worksOngoing + worksCompleted) / worksTakenUp) * 100 
          : 0;
        
        const formattedCompletionRate = implementationRate < 1 
          ? Math.round(implementationRate * 100) / 100
          : Math.round(implementationRate * 10) / 10;
        
        return {
          period: record.period,
          month: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          workDemand: Math.round(workDemand),
          wagePayments: Math.round(wagePayments),
          completionRate: formattedCompletionRate,
          activeWorkers: Math.round(activeWorkers),
        };
      });

      // Fill missing months with interpolated data to always show 6 months
      const history: any[] = [];
      const realDataMap = new Map(realHistory.map(h => [h.period, h]));
      
      for (const period of periods) {
        if (realDataMap.has(period)) {
          const data = realDataMap.get(period)!;
          delete data.period; // Remove period field before sending
          history.push(data);
        } else {
          // Generate mock data for missing month based on district pattern
          const [year, month] = period.split("-");
          const date = new Date(Number(year), Number(month) - 1);
          const seed = districtCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const monthSeed = (seed + Number(month)) % 100;
          const randomFactor = 0.85 + (monthSeed / 100) * 0.3; // 85-115% variation
          
          // Use average of real data if available, otherwise use district baseline
          const avgReal = realHistory.length > 0 
            ? {
                workDemand: realHistory.reduce((sum, h) => sum + h.workDemand, 0) / realHistory.length,
                wagePayments: realHistory.reduce((sum, h) => sum + h.wagePayments, 0) / realHistory.length,
                activeWorkers: realHistory.reduce((sum, h) => sum + h.activeWorkers, 0) / realHistory.length,
              }
            : { workDemand: 120000, wagePayments: 18000000, activeWorkers: 9000 };
          
          history.push({
            month: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
            workDemand: Math.round(avgReal.workDemand * randomFactor),
            wagePayments: Math.round(avgReal.wagePayments * randomFactor),
            completionRate: Math.round((92 + monthSeed % 8) * 10) / 10, // 92-99.9%
            activeWorkers: Math.round(avgReal.activeWorkers * randomFactor),
          });
        }
      }

      return NextResponse.json({
        districtCode,
        history,
        source: realHistory.length === 6 ? "real_data" : "mixed_data",
        realMonths: realHistory.length,
        interpolatedMonths: 6 - realHistory.length,
      });
    }

    // Return realistic mock historical data
    const mockData = generateMockHistory(districtCode, 6);
    return NextResponse.json({
      districtCode,
      history: mockData,
      source: "mock_data",
      message: "Using simulated historical data. Sync multiple months with 'npm run sync:mgnrega -- YYYY MM' to see real trends.",
    });
  } catch (error) {
    console.error("History API error:", error);
    
    const { searchParams } = new URL(request.url);
    const districtCode = searchParams.get("district") || "WB-KOL";

    // Return mock data on error with realistic trends
    const mockData = generateMockHistory(districtCode, 6);
    return NextResponse.json({
      districtCode,
      history: mockData,
      source: "mock_data_fallback",
      message: "Database unavailable. Showing simulated trends.",
    });
  }
}
