export interface CategoryOption {
  value: string;
  label: string;
}

export const MEDIA_CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "general", label: "General" },
  { value: "campus-tours", label: "Campus Tours" },
  { value: "src-events", label: "SRC Events" },
  { value: "awards-pageants", label: "Awards & Pageants" },
  { value: "street-quizzes", label: "Street Quizzes" },
  { value: "behind-the-scenes", label: "Behind the Scenes" },
  { value: "photography", label: "Photography" },
  { value: "video", label: "Video" },
  { value: "announcements", label: "Announcements" },
];

export const NEWS_CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "general", label: "General" },
  { value: "campus-events", label: "Campus Events" },
  { value: "pageants", label: "Pageants" },
  { value: "campus-tours", label: "Campus Tours" },
  { value: "street-quizzes", label: "Street Quizzes" },
  { value: "behind-the-scenes", label: "Behind the Scenes" },
  { value: "photography", label: "Photography" },
  { value: "announcements", label: "Announcements" },
  { value: "student-features", label: "Student Features" },
];

export const BOOKING_SERVICE_LABELS: Record<string, string> = {
  "event-coverage": "Event Coverage",
  "brand-activation": "Brand Activation",
  "campus-campaign": "Campus Campaign",
  photography: "Photography",
  videography: "Videography",
  "media-partnership": "Media Partnership",
  "creative-consulting": "Creative Consulting",
  other: "Other",
};

export function categoryLabel(value: string, options: CategoryOption[]): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
