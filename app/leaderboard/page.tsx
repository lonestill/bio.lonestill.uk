import { db } from "@/db";
import { profiles, users, linkClicks, profileViews } from "@/db/schema";
import { desc, sql, gte, eq } from "drizzle-orm";
import Link from "next/link";
import { Header } from "@/components/header";
import { Trophy, Eye, MousePointerClick, Sparkles, TrendingUp } from "lucide-react";

type LeaderboardEntry = {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  views: number;
  uniqueVisitors: number;
  linkClicks: number;
  uid: number | null;
  createdAt: Date | null;
};

async function getLeaderboard(sortBy: "views" | "clicks" | "new" = "views"): Promise<LeaderboardEntry[]> {
  const allProfiles = await db
    .select({
      userId: profiles.userId,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      views: profiles.views,
    })
    .from(profiles)
    .orderBy(desc(profiles.views))
    .all();

  const entries: LeaderboardEntry[] = [];

  for (const profile of allProfiles) {
    const user = await db
      .select({
        username: users.username,
        uid: users.uid,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, profile.userId))
      .get();

    if (!user) continue;

    // Get unique visitors count
    const uniqueVisitorsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${profileViews.visitorHash})` })
      .from(profileViews)
      .where(eq(profileViews.profileUserId, profile.userId))
      .get();
    const uniqueVisitors = uniqueVisitorsResult?.count || 0;

    // Get total link clicks
    const linkClicksResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(linkClicks)
      .where(eq(linkClicks.profileUserId, profile.userId))
      .get();
    const linkClicksCount = linkClicksResult?.count || 0;

    entries.push({
      username: user.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      views: typeof profile.views === 'number' ? profile.views : Number(profile.views) || 0,
      uniqueVisitors,
      linkClicks: linkClicksCount,
      uid: user.uid,
      createdAt: user.createdAt,
    });
  }

  // Sort based on sortBy parameter
  if (sortBy === "clicks") {
    entries.sort((a, b) => b.linkClicks - a.linkClicks);
  } else if (sortBy === "new") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    entries.sort((a, b) => {
      const aIsNew = a.createdAt && a.createdAt >= weekAgo ? 1 : 0;
      const bIsNew = b.createdAt && b.createdAt >= weekAgo ? 1 : 0;
      if (aIsNew !== bIsNew) return bIsNew - aIsNew;
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
  } else {
    entries.sort((a, b) => b.views - a.views);
  }

  return entries.slice(0, 50); // Top 50
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sortBy = (params.sort as "views" | "clicks" | "new") || "views";
  const leaderboard = await getLeaderboard(sortBy);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Background grid pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10">
        <Header />
        
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center border border-yellow-500/30">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <h1 className="text-5xl md:text-6xl font-mono font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  Лидерборд
                </h1>
              </div>
              <p className="text-lg font-mono text-neutral-400">
                Топ профилей по активности
              </p>
            </div>

            {/* Sort Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Link
                href="/leaderboard?sort=views"
                className={`px-6 py-3 rounded-xl font-mono text-sm transition-all ${
                  sortBy === "views"
                    ? "bg-purple-600/20 border border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                По просмотрам
              </Link>
              <Link
                href="/leaderboard?sort=clicks"
                className={`px-6 py-3 rounded-xl font-mono text-sm transition-all ${
                  sortBy === "clicks"
                    ? "bg-purple-600/20 border border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <MousePointerClick className="w-4 h-4 inline mr-2" />
                По кликам
              </Link>
              <Link
                href="/leaderboard?sort=new"
                className={`px-6 py-3 rounded-xl font-mono text-sm transition-all ${
                  sortBy === "new"
                    ? "bg-purple-600/20 border border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Новички недели
              </Link>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-neutral-500 font-mono">Пока нет профилей в рейтинге</p>
                </div>
              ) : (
                leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const medalColor = 
                    rank === 1 ? "from-yellow-500 to-amber-500" :
                    rank === 2 ? "from-gray-300 to-gray-400" :
                    rank === 3 ? "from-amber-600 to-amber-700" :
                    "from-purple-500 to-purple-600";

                  return (
                    <Link
                      key={entry.username}
                      href={`/${entry.username}`}
                      className="block group"
                    >
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-purple-500/50 transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                        <div className="flex items-center gap-6">
                          {/* Rank */}
                          <div className="flex-shrink-0 w-16 text-center">
                            {rank <= 3 ? (
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${medalColor} flex items-center justify-center mx-auto shadow-lg`}>
                                <span className="text-white font-bold text-lg">#{rank}</span>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-neutral-800/50 border border-neutral-700 flex items-center justify-center mx-auto">
                                <span className="text-neutral-400 font-mono font-bold">#{rank}</span>
                              </div>
                            )}
                          </div>

                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {entry.avatarUrl ? (
                              <img
                                src={entry.avatarUrl}
                                alt={entry.displayName || entry.username}
                                className="w-16 h-16 rounded-full border-2 border-purple-500/30 group-hover:border-purple-500/60 transition-colors"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-purple-500/30">
                                <span className="text-white font-mono font-bold text-xl">
                                  {(entry.displayName || entry.username)[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-mono font-semibold text-white truncate">
                                {entry.displayName || entry.username}
                              </h3>
                              {entry.uid && (
                                <span className="text-xs font-mono text-neutral-500 bg-neutral-800/50 px-2 py-1 rounded">
                                  #{entry.uid}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-mono text-neutral-400 mb-3">
                              @{entry.username}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm font-mono">
                              <div className="flex items-center gap-1.5 text-neutral-400">
                                <Eye className="w-4 h-4" />
                                <span>{entry.views.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-neutral-400">
                                <Sparkles className="w-4 h-4" />
                                <span>{entry.uniqueVisitors.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-neutral-400">
                                <MousePointerClick className="w-4 h-4" />
                                <span>{entry.linkClicks.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0 text-neutral-600 group-hover:text-purple-400 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
