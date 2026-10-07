"use client";

import { Profile } from "@/types";

interface ProfileCompletionProps {
  profile: Profile | null;
  isCreator?: boolean;
  creatorData?: {
    bio?: string | null;
    portfolio_url?: string | null;
    skills?: string[];
    availability?: string | null;
  } | null;
}

export function getProfileCompletion(
  profile: Profile | null,
  isCreator = false,
  creatorData?: ProfileCompletionProps["creatorData"]
): { percent: number; missing: string[] } {
  if (!profile) return { percent: 0, missing: ["Profile"] };

  const checks: { label: string; done: boolean }[] = [
    { label: "Full name", done: !!profile.full_name },
    { label: "Profile photo", done: !!profile.avatar_url },
    { label: "WhatsApp number", done: !!profile.whatsapp },
    { label: "Institution", done: !!profile.institution_id },
    { label: "Level of study", done: !!profile.level },
    { label: "Bio", done: !!profile.bio },
  ];

  if (isCreator) {
    checks.push({ label: "Creator bio", done: !!creatorData?.bio });
    checks.push({ label: "Portfolio link", done: !!creatorData?.portfolio_url });
    checks.push({ label: "Skills", done: (creatorData?.skills?.length || 0) > 0 });
    checks.push({ label: "Availability", done: !!creatorData?.availability });
  }

  const done = checks.filter((c) => c.done).length;
  const missing = checks.filter((c) => !c.done).map((c) => c.label);

  return {
    percent: Math.round((done / checks.length) * 100),
    missing,
  };
}

export function ProfileCompletion({ profile, isCreator = false, creatorData }: ProfileCompletionProps) {
  const { percent, missing } = getProfileCompletion(profile, isCreator, creatorData);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Profile Completion</span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: percent >= 80 ? "#22c55e" : percent >= 50 ? "#eab308" : "#d4a843",
          }}
        />
      </div>
      {missing.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Add {missing.slice(0, 3).join(", ")}{missing.length > 3 ? ` and ${missing.length - 3} more` : ""} to complete your profile.
        </p>
      )}
    </div>
  );
}
