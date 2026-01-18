import { notFound } from "next/navigation";
import { db } from "@/db";
import { profiles, users, profileViews, BadgeType } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { BioRenderer } from "@/components/bio-renderer";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const data = await db
    .select({
      bio: profiles.bioText,
      avatar: profiles.avatarUrl,
      displayName: profiles.displayName,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(eq(users.username, decodedUsername))
    .get();

  if (!data) {
    return { title: "User not found" };
  }

  return {
    title: data.displayName || decodedUsername,
    description: data.bio || `Check out ${decodedUsername}'s bio page.`,
    openGraph: {
      title: data.displayName || decodedUsername,
      description: data.bio || `Check out ${decodedUsername}'s bio page.`,
      images: data.avatar ? [data.avatar] : ["/default-avatar.png"],
    },
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const data = await db
    .select()
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(eq(users.username, decodedUsername))
    .get();

  if (!data) {
    notFound();
  }

  const { profiles: profileData, users: userData } = data;
  const userBadges: BadgeType[] = userData.badges || [];

  // Count unique views (unique visitors)
  const uniqueViewsResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${profileViews.visitorHash})` })
    .from(profileViews)
    .where(eq(profileViews.profileUserId, userData.id))
    .get();
  
  const uniqueViews = uniqueViewsResult?.count || 0;

  return (
    <main className="h-screen w-screen overflow-hidden">
      <BioRenderer 
        profile={profileData} 
        username={userData.username}
        numericUid={userData.uid ?? undefined}
        createdAt={userData.createdAt}
        badges={userBadges}
        uniqueViews={uniqueViews}
      />
    </main>
  );
}