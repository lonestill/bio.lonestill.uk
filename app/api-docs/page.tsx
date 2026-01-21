"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Code,
  Copy,
  ExternalLink,
  Key,
  Search,
  Shield,
  Terminal,
  User,
} from "lucide-react";

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {label ? (
        <div className="flex items-center justify-between px-4 py-2 text-xs font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-t-xl">
          <span>{label}</span>
          <span className="text-neutral-600">monospace</span>
        </div>
      ) : null}
      <pre className={`bg-black ${label ? "rounded-b-xl" : "rounded-xl"} p-4 overflow-x-auto border border-neutral-800`}>
        <code className="text-sm font-mono text-neutral-300 whitespace-pre">{code}</code>
      </pre>
      <button
        onClick={copyCode}
        className="absolute top-3 right-3 p-2 rounded-lg bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-700"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
      </button>
    </div>
  );
}

function EndpointCard({
  method,
  path,
  summary,
  children,
}: {
  method: "GET" | "POST";
  path: string;
  summary: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const methodColors = {
    GET: "bg-green-500/15 text-green-400 border-green-500/30",
    POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  } as const;

  return (
    <div className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-950/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 hover:bg-neutral-900/50 transition-colors"
      >
        <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${methodColors[method]}`}>
          {method}
        </span>
        <div className="flex flex-col items-start flex-1 text-left">
          <code className="font-mono text-white text-sm">{path}</code>
          <p className="text-neutral-500 text-xs font-mono">{summary}</p>
        </div>
        <ChevronRight className={`w-5 h-5 text-neutral-500 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="border-t border-neutral-800"
          >
            <div className="p-6 space-y-6">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const SECTIONS = [
  {
    id: "welcome",
    title: "Welcome",
    icon: BookOpen,
  },
  {
    id: "base-url",
    title: "Base URL",
    icon: Terminal,
  },
  {
    id: "auth",
    title: "Authentication",
    icon: Key,
  },
  {
    id: "rate-limits",
    title: "Rate limits",
    icon: Activity,
  },
  {
    id: "requests",
    title: "Making requests",
    icon: Code,
  },
  {
    id: "endpoints",
    title: "Endpoints",
    icon: User,
  },
  {
    id: "errors",
    title: "Errors",
    icon: AlertTriangle,
  },
];

const ERROR_CODES = [
  { code: 200, label: "OK", color: "text-green-400", detail: "Request succeeded." },
  { code: 400, label: "Bad Request", color: "text-amber-400", detail: "Payload is missing or malformed." },
  { code: 401, label: "Unauthorized", color: "text-red-400", detail: "Missing or invalid bearer token." },
  { code: 404, label: "Not Found", color: "text-amber-400", detail: "Requested resource does not exist." },
  { code: 429, label: "Too Many Requests", color: "text-amber-400", detail: "Rate limit exceeded. Retry after reset." },
  { code: 500, label: "Internal Error", color: "text-red-400", detail: "Unexpected server issue. Try again." },
];

export default function ApiDocsPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("welcome");

  const filteredSections = useMemo(() => {
    if (!search) return SECTIONS;
    const q = search.toLowerCase();
    return SECTIONS.filter((section) => section.title.toLowerCase().includes(q));
  }, [search]);

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <aside className="w-72 shrink-0 border-r border-neutral-800 fixed left-0 top-0 h-screen overflow-y-auto bg-gradient-to-b from-neutral-950 to-[#050505]">
        <div className="p-6 border-b border-neutral-800">
          <Link href="/" className="flex items-center gap-2 group font-mono">
            <span className="text-purple-400">~</span>
            <span className="text-neutral-300 group-hover:text-white transition-colors">/lonestill</span>
          </Link>
          <div className="text-xs font-mono text-neutral-600 mt-1">API Documentation</div>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sections"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        <nav className="px-3 py-2 space-y-3">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isActive = active === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border border-transparent ${
                  isActive
                    ? "bg-purple-600/15 text-purple-300 border-purple-500/40"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/60 hover:border-neutral-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-mono text-sm">{section.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800 bg-[#0a0a0a]">
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              Base URL
            </div>
            <code className="text-xs font-mono text-purple-400">https://bio.lonestill.uk/api/v1</code>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-72">
        <header className="border-b border-neutral-800 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="px-12 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h1 className="font-mono font-bold text-white">API Docs</h1>
              <span className="text-xs font-mono text-neutral-600">Updated weekly</span>
            </div>
            <Link
              href="/dashboard?tab=api"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm transition-all"
            >
              <Key className="w-4 h-4" />
              Get API key
            </Link>
          </div>
        </header>

        <div className="px-12 py-12 space-y-16">
          <section id="welcome" className="scroll-mt-24">
            <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-purple-600/15 via-neutral-900 to-neutral-950 p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-mono text-neutral-400">/api/v1</p>
                  <h2 className="text-3xl font-mono font-bold text-white">Ship bios without touching a database.</h2>
                  <p className="text-neutral-400 font-mono text-sm max-w-3xl">
                    Query public lonestill bios, stats, and badges with a single bearer token. These docs follow a GitBook-like structure: concise sections, examples you can paste, and clear defaults.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">REST over HTTPS</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">JSON responses</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">Bearer auth</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-xs font-mono text-neutral-400">
                    <div className="flex items-center gap-2 text-neutral-500 mb-2">
                      <Shield className="w-4 h-4" />
                      Security first
                    </div>
                    <p>Token scope is account-bound. Rotate keys in dashboard if leaked.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="base-url" className="scroll-mt-24 space-y-4">
            <h3 className="text-xl font-mono font-semibold flex items-center gap-3 text-white">
              <Terminal className="w-5 h-5 text-purple-400" />
              Base URL
            </h3>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 flex items-center justify-between">
              <code className="text-sm font-mono text-purple-300">https://bio.lonestill.uk/api/v1</code>
              <Link href="/dashboard?tab=api" className="text-xs font-mono text-purple-300 flex items-center gap-1 hover:text-purple-200">
                Manage keys <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          <section id="auth" className="scroll-mt-24 space-y-4">
            <h3 className="text-xl font-mono font-semibold flex items-center gap-3 text-white">
              <Key className="w-5 h-5 text-purple-400" />
              Authentication
            </h3>
            <p className="text-neutral-400 font-mono text-sm max-w-3xl">
              Send a bearer token issued from your dashboard. Place it in the Authorization header. Tokens never expire automatically; rotate if compromised.
            </p>
            <CodeBlock
              code={`curl "https://bio.lonestill.uk/api/v1/profile/gitty" \\
  -H "Authorization: Bearer bio_xxxxxxxxxxxxx"`}
            />
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex gap-3 items-start">
              <Shield className="w-5 h-5 text-amber-300" />
              <p className="text-sm font-mono text-amber-200/90">
                Never ship tokens client-side. Use server-side calls or serverless functions and keep tokens in environment variables.
              </p>
            </div>
          </section>

          <section id="rate-limits" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-mono font-semibold text-white">Rate limits</h3>
            </div>
            <p className="text-neutral-400 font-mono text-sm">Default: 1,000 requests/day per token.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{ label: "Requests per day", value: "1,000" }, { label: "Tokens per account", value: "5" }, { label: "Reset", value: "UTC midnight" }].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-lg font-mono font-bold text-white">{item.value}</div>
                  <div className="text-xs font-mono text-neutral-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
            <CodeBlock
              label="Response headers"
              code={`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 997
X-RateLimit-Reset: 1704067200`}
            />
          </section>

          <section id="requests" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-mono font-semibold text-white">Making requests</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CodeBlock
                label="curl"
                code={`curl "https://bio.lonestill.uk/api/v1/profile/gitty" \\
  -H "Authorization: Bearer bio_xxxxx"`}
              />
              <CodeBlock
                label="JavaScript (fetch)"
                code={`const res = await fetch("https://bio.lonestill.uk/api/v1/profile/gitty", {
  headers: { Authorization: "Bearer " + process.env.BIO_API_KEY },
});
const { data } = await res.json();`}
              />
            </div>
          </section>

          <section id="endpoints" className="scroll-mt-24 space-y-8">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-mono font-semibold text-white">Endpoints</h3>
            </div>

            <EndpointCard method="GET" path="/api/v1/profile/:username" summary="Fetch a public profile by username.">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded bg-purple-500/15 text-purple-200 text-xs font-mono">Path params</span>
                  <code className="text-sm font-mono text-purple-300">username</code>
                  <span className="text-xs font-mono text-neutral-500">Required</span>
                </div>
                <p className="text-sm font-mono text-neutral-400">
                  Returns profile metadata, stats, badges, social connections, and createdAt timestamps. Cached for 60s with background revalidation.
                </p>
                <CodeBlock
                  code={`{
  "data": {
    "username": "gitty",
    "uid": 1,
    "displayName": "Gitty",
    "bio": "Developer",
    "avatar": "https://...",
    "badges": ["early_adopter", "hello_kitty"],
    "stats": { "views": 1234, "createdAt": "2024-01-01T00:00:00.000Z" },
    "socials": ["twitter", "github"],
    "connections": { "github": { "username": "gitty" } }
  }
}`}
                />
              </div>
            </EndpointCard>

            <EndpointCard method="GET" path="/api/v1/users" summary="Paginated list of public profiles with sorting.">
              <div className="space-y-4">
                <div className="space-y-2">
                  {[
                    { name: "limit", defaultValue: "10", detail: "Max items per page (1-100)." },
                    { name: "offset", defaultValue: "0", detail: "Pagination cursor in items." },
                    { name: "sort", defaultValue: "views", detail: "views | created | uid." },
                    { name: "q", defaultValue: "", detail: "Search username or display name." },
                    { name: "badge", defaultValue: "", detail: "Filter by badge (premium, hello_kitty, etc.)." },
                    { name: "hasAvatar", defaultValue: "false", detail: "Only users with avatars when true." },
                    { name: "minViews", defaultValue: "0", detail: "Require at least this many unique views." },
                    { name: "createdAfter", defaultValue: "", detail: "ISO date to filter recently created users." },
                  ].map((param) => (
                    <div key={param.name} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-3">
                      <code className="text-purple-300 font-mono text-sm">{param.name}</code>
                      <span className="text-xs text-neutral-500">= {param.defaultValue}</span>
                      <span className="text-neutral-400 font-mono text-sm">— {param.detail}</span>
                    </div>
                  ))}
                </div>
                <CodeBlock
                  code={`{
  "data": [
    {
      "username": "gitty",
      "uid": 1,
      "displayName": "Gitty",
      "avatar": "https://...",
      "badges": ["early_adopter"],
      "stats": { "views": 1234 }
    }
  ],
  "pagination": { "total": 100, "limit": 10, "offset": 0, "hasMore": true }
}`}
                />
              </div>
            </EndpointCard>

            <EndpointCard method="GET" path="/api/v1/users/trending" summary="Most viewed users in a rolling window.">
              <div className="space-y-4">
                <div className="space-y-2">
                  {[
                    { name: "windowDays", defaultValue: "7", detail: "Rolling window in days (max 30)." },
                    { name: "limit", defaultValue: "10", detail: "Max items per page (1-50)." },
                    { name: "offset", defaultValue: "0", detail: "Pagination cursor in items." },
                    { name: "q", defaultValue: "", detail: "Search username or display name." },
                    { name: "badge", defaultValue: "", detail: "Filter by badge." },
                  ].map((param) => (
                    <div key={param.name} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-3">
                      <code className="text-purple-300 font-mono text-sm">{param.name}</code>
                      <span className="text-xs text-neutral-500">= {param.defaultValue}</span>
                      <span className="text-neutral-400 font-mono text-sm">— {param.detail}</span>
                    </div>
                  ))}
                </div>
                <CodeBlock
                  code={`{
  "data": [
    {
      "username": "gitty",
      "uid": 1,
      "displayName": "Gitty",
      "avatar": "https://...",
      "badges": ["early_adopter"],
      "stats": {
        "views": { "window": 240, "allTime": 1200 },
        "windowDays": 7,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "pagination": { "total": 20, "limit": 10, "offset": 0, "hasMore": true },
  "windowDays": 7
}`}
                />
              </div>
            </EndpointCard>
          </section>

          <section id="errors" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-mono font-semibold text-white">Errors</h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-neutral-800">
              <table className="w-full">
                <thead className="bg-neutral-900">
                  <tr>
                    <th className="text-left px-4 py-3 font-mono text-sm text-neutral-500">Code</th>
                    <th className="text-left px-4 py-3 font-mono text-sm text-neutral-500">Status</th>
                    <th className="text-left px-4 py-3 font-mono text-sm text-neutral-500">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {ERROR_CODES.map((e) => (
                    <tr key={e.code}>
                      <td className={`px-4 py-3 font-mono text-sm font-bold ${e.color}`}>{e.code}</td>
                      <td className="px-4 py-3 font-mono text-sm text-white">{e.label}</td>
                      <td className="px-4 py-3 font-mono text-sm text-neutral-400">{e.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border-t border-neutral-800 pt-10 flex items-center justify-between gap-6 flex-wrap">
            <div className="space-y-1">
              <h4 className="text-lg font-mono font-semibold text-white">Ready to build?</h4>
              <p className="text-sm font-mono text-neutral-400">Create a token and start hitting the endpoints in seconds.</p>
            </div>
            <Link
              href="/dashboard?tab=api"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono transition-all"
            >
              <Key className="w-4 h-4" />
              Open dashboard
              <ExternalLink className="w-4 h-4" />
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
