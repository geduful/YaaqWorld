import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Profile } from "@/types";

export async function createServerAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // SameSite=Lax + Secure(prod). NOT httpOnly: the @supabase/ssr browser
      // client must read the session cookie — documented deliberate exception.
      cookieOptions: {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component during a token refresh;
            // cookie writes are only allowed in Server Actions/Route
            // Handlers. Middleware refreshes the session on every
            // request and persists the rotated cookies, so ignoring
            // this write is safe.
          }
        },
      },
    }
  );
}

export async function getServerSession() {
  const supabase = await createServerAuthClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getServerUser() {
  const supabase = await createServerAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getServerProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerAuthClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return null;
  }
  return data as Profile;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    return { session: null, user: null, profile: null, error: "Unauthorized" };
  }
  const profile = await getServerProfile(session.user.id);
  return { session, user: session.user, profile, error: null };
}

export async function requireRole(allowedRoles: string[]) {
  const { session, user, profile, error } = await requireAuth();
  if (error || !profile || !allowedRoles.includes(profile.role)) {
    return { session: null, user: null, profile: null, error: "Forbidden" };
  }
  return { session, user, profile, error: null };
}