import { createServerAuthClient } from "@/lib/auth-server";
import { isSupabaseConfigured } from "@/lib/supabase-browser";
import { CreatorOpportunity, Media, NewsArticle, Service } from "@/types";

const LIST_LIMIT = 100;

/** Published media items for the public media hub (anon-safe). */
export async function getPublishedMedia(): Promise<Media[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerAuthClient();
  const { data } = await supabase
    .from("media_items")
    .select("*")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(LIST_LIMIT);
  return (data ?? []) as Media[];
}

/** One published media item by slug (null when missing or draft). */
export async function getPublishedMediaBySlug(slug: string): Promise<Media | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerAuthClient();
  const { data } = await supabase
    .from("media_items")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  return (data as Media | null) ?? null;
}

/** Published news articles, newest first. */
export async function getPublishedNews(): Promise<NewsArticle[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerAuthClient();
  const { data } = await supabase
    .from("news_articles")
    .select("*")
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(LIST_LIMIT);
  return (data ?? []) as NewsArticle[];
}

/** One published article by slug, with the author's display name. */
export async function getPublishedNewsBySlug(
  slug: string
): Promise<(NewsArticle & { author_name: string | null }) | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerAuthClient();
  const { data } = await supabase
    .from("news_articles")
    .select("*, author:profiles(full_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (!data) return null;
  const row = data as NewsArticle & { author: { full_name: string | null } | null };
  return { ...row, author_name: row.author?.full_name ?? null };
}

/** Active services for the public services page. */
export async function getActiveServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerAuthClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(LIST_LIMIT);
  return (data ?? []) as Service[];
}

/** Live, open, unexpired opportunities for the creator portal. */
export async function getOpenOpportunities(): Promise<CreatorOpportunity[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerAuthClient();
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .eq("status", "open")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .or(`deadline.is.null,deadline.gte.${new Date().toISOString().slice(0, 10)}`)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("published_at", { ascending: false })
    .limit(LIST_LIMIT);
  return (data ?? []) as CreatorOpportunity[];
}
