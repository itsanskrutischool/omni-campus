"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type BlueprintSection = {
  title: string
  items: string[]
}

interface ModuleBlueprintPageProps {
  eyebrow: string
  title: string
  description: string
  references: string[]
  sections: BlueprintSection[]
}

export function ModuleBlueprintPage({
  eyebrow,
  title,
  description,
  references,
  sections,
}: ModuleBlueprintPageProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="space-y-4">
        <Badge className="rounded-full bg-blue-500/10 text-blue-700 hover:bg-blue-500/10">
          {eyebrow}
        </Badge>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="max-w-3xl text-sm font-medium text-slate-500 dark:text-slate-300">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {references.map((reference) => (
            <Badge key={reference} variant="outline" className="rounded-full px-3 py-1 text-[11px] font-bold">
              {reference}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="rounded-3xl border border-slate-200/80 shadow-sm dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-tight">{section.title}</CardTitle>
              <CardDescription>Structured from the reference ERP hierarchy for the next implementation pass.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
