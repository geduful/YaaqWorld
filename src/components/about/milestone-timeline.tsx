"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface Milestone {
  year: string;
  title: string;
  desc: string;
  activities?: string[];
}

const INITIAL_VISIBLE = 4;

export function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? milestones : milestones.slice(0, INITIAL_VISIBLE);
  const hiddenCount = milestones.length - INITIAL_VISIBLE;

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
      <div className="space-y-8">
        {visible.map((milestone, i) => (
          <div key={`${milestone.year}-${milestone.title}-${i}`} className={`relative pl-20 animate-in stagger-${Math.min(i + 1, 10)}`}>
            <div className="absolute left-0 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-yaaq-gold text-yaaq-navy font-bold text-lg">
              {i + 1}
            </div>
            <div className="ml-4">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-xl font-bold text-yaaq-gold-ink">{milestone.year}</span>
                <h3 className="font-display text-lg font-semibold text-foreground">{milestone.title}</h3>
              </div>
              <p className="mt-1 text-muted-foreground">{milestone.desc}</p>
              {milestone.activities && (
                <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-muted-foreground">
                  {milestone.activities.map((activity) => (
                    <li key={activity}>{activity}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
      {!expanded && hiddenCount > 0 && (
        <div className="mt-8 pl-20">
          <Button type="button" variant="outline" size="sm" onClick={() => setExpanded(true)}>
            View more ({hiddenCount} {hiddenCount === 1 ? "milestone" : "milestones"})
          </Button>
        </div>
      )}
    </div>
  );
}
