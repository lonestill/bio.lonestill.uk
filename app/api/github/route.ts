import { NextRequest, NextResponse } from "next/server";

interface GitHubUser {
  login: string;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubEvent {
  type: string;
  repo: {
    name: string;
  };
  payload?: {
    commits?: Array<{
      message: string;
      sha: string;
      url: string;
    }>;
  };
  created_at: string;
}

interface GitHubRepo {
  name: string;
  full_name?: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
  pinned?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }

    const userData: GitHubUser = await userResponse.json();

    // Fetch recent events to get last commit
    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=30`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 300 },
      }
    );

    let lastCommit = null;
    if (eventsResponse.ok) {
      const events: GitHubEvent[] = await eventsResponse.json();
      
      // Find the most recent PushEvent with commits
      // Try to find PushEvent first
      let pushEvent = events.find((e) => {
        return e.type === "PushEvent" && 
               e.payload?.commits && 
               Array.isArray(e.payload.commits) && 
               e.payload.commits.length > 0;
      });
      
      // If no PushEvent, try to get commits from user's repos directly
      if (!pushEvent) {
        // Try to get recent commits from user's repos
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=5`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
            next: { revalidate: 300 },
          }
        );
        
        if (reposResponse.ok) {
          const repos: GitHubRepo[] = await reposResponse.json();
          
          // Try to get commits from the most recently updated repo
          for (const repo of repos.slice(0, 3)) {
            try {
              const commitsResponse = await fetch(
                `https://api.github.com/repos/${repo.full_name || `${username}/${repo.name}`}/commits?per_page=1`,
                {
                  headers: {
                    Accept: "application/vnd.github.v3+json",
                  },
                  next: { revalidate: 300 },
                }
              );
              
              if (commitsResponse.ok) {
                const commits: any[] = await commitsResponse.json();
                if (commits && commits.length > 0) {
                  const commit = commits[0];
                  lastCommit = {
                    repo: repo.name,
                    message: commit.commit?.message?.split('\n')[0] || "No message",
                    date: commit.commit?.author?.date || new Date().toISOString(),
                    url: commit.html_url || `https://github.com/${repo.full_name || `${username}/${repo.name}`}/commit/${commit.sha}`,
                  };
                  break;
                }
              }
            } catch (err) {
              // Continue to next repo
              continue;
            }
          }
        }
      } else if (pushEvent && pushEvent.payload?.commits && pushEvent.payload.commits.length > 0) {
        // Use PushEvent commit
        const commit = pushEvent.payload.commits[pushEvent.payload.commits.length - 1];
        lastCommit = {
          repo: pushEvent.repo.name,
          message: commit.message?.split('\n')[0] || commit.message || "No message",
          date: pushEvent.created_at,
          url: commit.url ? commit.url.replace('api.github.com/repos/', 'github.com/').replace('/git/commits/', '/commit/') : `https://github.com/${pushEvent.repo.name}/commit/${commit.sha}`,
        };
      }
    }

    // Fetch repositories to get pinned repos (we'll get top starred repos as pinned)
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 300 },
      }
    );

    let pinnedRepos: Array<{
      name: string;
      description: string;
      stars: number;
      language: string;
      url: string;
    }> = [];

    if (reposResponse.ok) {
      const repos: GitHubRepo[] = await reposResponse.json();
      // Get top starred repos
      const topRepos = repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6)
        .map((repo) => ({
          name: repo.name,
          description: repo.description || "No description",
          stars: repo.stargazers_count,
          language: repo.language || "Unknown",
          url: repo.html_url,
        }));
      
      pinnedRepos = topRepos;
    }

    return NextResponse.json({
      username: userData.login,
      avatar_url: userData.avatar_url,
      bio: userData.bio,
      public_repos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      lastCommit,
      pinnedRepos,
    });
  } catch (error: any) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
