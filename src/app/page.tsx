import Link from "next/link";

import { DistrictPicker } from "@/components/district-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="bg-linear-to-b from-background to-secondary/20">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center gap-16 px-6 pb-24 pt-12 sm:px-10 lg:flex-row lg:items-start lg:gap-24">
        <div className="flex max-w-2xl flex-col gap-8 text-center lg:text-left">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
            भरोसा योग्य डेटा • Trusted & cached data
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Your district&apos;s MGNREGA story in simple words.
          </h1>
          <p className="text-lg text-muted-foreground">
            No charts to decode, just clear sentences, local language support, and audio explainers—built
            for every citizen to monitor work demand, wage payments, and progress without fear of data
            outages.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/dashboard">Preview dashboard</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="#architecture">See system design</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Offline-ready</CardTitle>
                <CardDescription>API outages handled with cached snapshots.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Automatic nightly syncs from data.gov.in feed the Mongo data lake and keep summaries fresh.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Inclusive UI</CardTitle>
                <CardDescription>Designed for low-literacy audiences.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Story mode, icon cues, and bilingual copy make complex indicators easy to follow.
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-6 lg:max-w-md">
          <DistrictPicker />
          <Card id="architecture" className="w-full">
            <CardHeader>
              <CardTitle>Technical kick-off</CardTitle>
              <CardDescription>Initial production foundations are wired in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>• Next.js 16 App Router with Tailwind v4 and shadcn primitives.</li>
                <li>• MongoDB client helper with validated environment config.</li>
                <li>• Structured component library ready for charts and maps.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
