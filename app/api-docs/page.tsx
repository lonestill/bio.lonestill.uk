"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Search,
  Key,
  User,
  Users,
  Zap,
  AlertTriangle,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Code,
  BookOpen,
  Terminal,
  Shield,
  Activity,
} from "lucide-react";

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-black rounded-xl p-4 overflow-x-auto border border-neutral-800">
        <code className="text-sm font-mono text-neutral-300 whitespace-pre">{code}</code>
      </pre>
      <button
        onClick={copyCode}
        className="absolute top-3 right-3 p-2 rounded-lg bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-700"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
      </button>
    </div>
  );
}

function EndpointCard({
  method,
  path,
  description,
  children,
}: {
  method: "GET" | "POST" | "DELETE";
  path: string;
  description: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const methodColors = {
    GET: "bg-green-500/20 text-green-400 border-green-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-900/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 hover:bg-neutral-800/30 transition-colors"
      >
        <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${methodColors[method]}`}>
          {method}
        </span>
        <code className="font-mono text-white flex-1 text-left">{path}</code>
        <ChevronRight className={`w-5 h-5 text-neutral-500 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-neutral-800"
          >
            <div className="p-6 space-y-6">
              <p className="text-neutral-400 font-mono">{description}</p>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApiDocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("authentication");
  const t = useTranslations("apiDocs");

  const API_SECTIONS = [
    { category: t("sidebar.basics"), items: [
      { id: "authentication", title: t("sidebar.authentication"), icon: Key },
      { id: "rate-limiting", title: t("sidebar.rateLimiting"), icon: Activity },
      { id: "caching", title: t("sidebar.caching"), icon: Zap },
    ]},
    { category: "API Reference", items: [
      { id: "get-profile", title: "GET /profile/:username", icon: User },
      { id: "get-users", title: "GET /users", icon: Users },
    ]},
    { category: t("sidebar.reference"), items: [
      { id: "errors", title: t("sidebar.errors"), icon: AlertTriangle },
      { id: "examples", title: t("sidebar.examples"), icon: Code },
    ]},
  ];

  const ERROR_CODES = [
    { code: 200, status: "OK", description: t("errors.200"), color: "text-green-400" },
    { code: 400, status: "Bad Request", description: t("errors.400"), color: "text-amber-400" },
    { code: 401, status: "Unauthorized", description: t("errors.401"), color: "text-red-400" },
    { code: 404, status: "Not Found", description: t("errors.404"), color: "text-amber-400" },
    { code: 429, status: "Too Many Requests", description: t("errors.429"), color: "text-amber-400" },
    { code: 500, status: "Internal Error", description: t("errors.500"), color: "text-red-400" },
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery) return API_SECTIONS;
    const query = searchQuery.toLowerCase();
    return API_SECTIONS.map(category => ({
      ...category,
      items: category.items.filter(item => item.title.toLowerCase().includes(query))
    })).filter(category => category.items.length > 0);
  }, [searchQuery, API_SECTIONS]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-neutral-800 fixed left-0 top-0 h-screen overflow-y-auto bg-[#0a0a0a]">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-800">
          <Link href="/" className="flex items-center gap-2 group font-mono">
            <span className="text-purple-400">~</span>
            <span className="text-neutral-300 group-hover:text-white transition-colors">/lonestill</span>
          </Link>
          <div className="text-xs font-mono text-neutral-600 mt-1">{t("sidebar.apiDocumentation")}</div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("sidebar.search")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-2 space-y-6">
          {filteredSections.map((category) => (
            <div key={category.category}>
              <div className="px-3 mb-2">
                <h3 className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider">
                  {category.category}
                </h3>
              </div>
              <div className="space-y-1">
                {category.items.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="font-mono text-sm">{section.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Base URL */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800 bg-[#0a0a0a]">
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              {t("sidebar.baseUrl")}
            </div>
            <code className="text-xs font-mono text-purple-400">https://bio.lonestill.uk/api/v1</code>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        {/* Header */}
        <header className="border-b border-neutral-800 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="px-12 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h1 className="font-mono font-bold text-white">{t("header.title")}</h1>
            </div>
            <Link
              href="/dashboard?tab=api"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm transition-all"
            >
              <Key className="w-4 h-4" />
              {t("header.getApiKey")}
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="px-12 py-10">
          <div className="space-y-20">
            {/* Getting Started Section */}
            <div className="space-y-12">
              <div className="border-b border-neutral-800 pb-2">
                <h2 className="text-sm font-mono font-semibold text-neutral-500 uppercase tracking-wider">
                  {t("sidebar.basics")}
                </h2>
              </div>

            {/* Authentication */}
            <section id="authentication" className="scroll-mt-20 space-y-6">
              <h2 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
                <Key className="w-6 h-6 text-purple-400" />
                {t("auth.title")}
              </h2>
              <p className="text-neutral-400 font-mono">
                {t("auth.description")} <code className="text-purple-400">Authorization</code>:
              </p>
              <CodeBlock code={`curl "https://bio.lonestill.uk/api/v1/profile/username" \\
  -H "Authorization: Bearer bio_xxxxxxxxxxxxx"`} />
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                <Shield className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-sm font-mono text-amber-400/90">
                  {t("auth.warning")}
                </p>
              </div>
            </section>

            {/* Rate Limiting */}
            <section id="rate-limiting" className="scroll-mt-20 space-y-6 pt-8 border-t border-neutral-800/50">
              <h2 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
                <Activity className="w-6 h-6 text-purple-400" />
                Rate Limiting
              </h2>
              <p className="text-neutral-400 font-mono">
                {t("rateLimit.description")} <span className="text-purple-400">1,000 {t("rateLimit.limit")}</span>
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "1,000", label: t("rateLimit.requestsPerDay"), color: "purple" },
                  { value: "5", label: t("rateLimit.tokensPerAccount"), color: "green" },
                  { value: "∞", label: t("rateLimit.expiration"), color: "amber" },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                    <div className={`text-2xl font-mono font-bold text-${stat.color}-400`}>{stat.value}</div>
                    <div className="text-xs font-mono text-neutral-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              <CodeBlock code={`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200`} />
            </section>

            {/* Caching */}
            <section id="caching" className="scroll-mt-20 space-y-6 pt-8 border-t border-neutral-800/50">
              <h2 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
                <Zap className="w-6 h-6 text-purple-400" />
                {t("cache.title")}
              </h2>
              <p className="text-neutral-400 font-mono">{t("cache.description")}</p>
              <div className="overflow-hidden rounded-xl border border-neutral-800">
                <table className="w-full">
                  <thead className="bg-neutral-900">
                    <tr>
                      <th className="text-left px-4 py-3 font-mono text-sm text-neutral-400">{t("cache.endpoint")}</th>
                      <th className="text-left px-4 py-3 font-mono text-sm text-neutral-400">{t("cache.cacheTime")}</th>
                      <th className="text-left px-4 py-3 font-mono text-sm text-neutral-400">{t("cache.swr")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-white">/profile/:username</td>
                      <td className="px-4 py-3 font-mono text-sm text-green-400">60s</td>
                      <td className="px-4 py-3 font-mono text-sm text-neutral-400">5 min</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-white">/users</td>
                      <td className="px-4 py-3 font-mono text-sm text-green-400">5 min</td>
                      <td className="px-4 py-3 font-mono text-sm text-neutral-400">10 min</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            </div>

            {/* API Reference Section */}
            <div className="space-y-12 border-t border-neutral-800 pt-12">
              <div className="border-b border-neutral-800 pb-2">
                <h2 className="text-sm font-mono font-semibold text-neutral-500 uppercase tracking-wider">
                  API Reference
                </h2>
              </div>

            {/* GET Profile */}
            <section id="get-profile" className="scroll-mt-20 space-y-6">
              <h2 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
                <User className="w-6 h-6 text-purple-400" />
                {t("getProfile.title")}
              </h2>
              <EndpointCard method="GET" path="/api/v1/profile/:username" description={t("getProfile.description")}>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-mono text-neutral-500 mb-2">{t("getProfile.params")}</h4>
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-3">
                      <code className="text-purple-400 font-mono text-sm">username</code>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">required</span>
                      <span className="text-neutral-400 font-mono text-sm">— {t("getProfile.username")}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-mono text-neutral-500 mb-2">{t("getProfile.response")}</h4>
                    <CodeBlock
                      code={`{
  "data": {
    "username": "gitty",
    "uid": 1,
    "displayName": "Gitty",
    "bio": "Developer",
    "avatar": "https://...",
    "badges": ["early_adopter", "hacker"],
    "stats": {
      "views": 1234,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "socials": [...],
    "connections": {
      "github": { "username": "gitty" }
    }
  }
}`}
                    />
                  </div>
                </div>
              </EndpointCard>
            </section>

            {/* GET Users */}
            <section id="get-users" className="scroll-mt-20 space-y-6 pt-8 border-t border-neutral-800/50">
              <h2 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-400" />
                {t("getUsers.title")}
              </h2>
              <EndpointCard method="GET" path="/api/v1/users" description={t("getUsers.description")}>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-mono text-neutral-500 mb-2">{t("getUsers.queryParams")}</h4>
                    <div className="space-y-2">
                      {[
                        { name: "limit", default: "10", desc: t("getUsers.limit") },
                        { name: "offset", default: "0", desc: t("getUsers.offset") },
                        { name: "sort", default: "views", desc: t("getUsers.sort") },
                      ].map((p) => (
                        <div key={p.name} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-3">
                          <code className="text-purple-400 font-mono text-sm">{p.name}</code>
                          <span className="text-xs text-neutral-500">= {p.default}</span>
                          <span className="text-neutral-400 font-mono text-sm">— {p.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-mono text-neutral-500 mb-2">{t("getUsers.response")}</h4>
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
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}`}
                    />
                  </div>
                </div>
              </EndpointCard>
            </section>
            </div>

            {/* Reference Section */}
            <div className="space-y-12 border-t border-neutral-800 pt-12">
              <div className="border-b border-neutral-800 pb-2">
                <h2 className="text-sm font-mono font-semibold text-neutral-500 uppercase tracking-wider">
                  {t("sidebar.reference")}
                </h2>
              </div>

            {/* Errors */}
            <section id="errors" className="scroll-mt-20 space-y-6">
              <h2 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-purple-400" />
                {t("errors.title")}
              </h2>
              <div className="overflow-hidden rounded-xl border border-neutral-800">
                <table className="w-full">
                  <thead className="bg-neutral-900">
                    <tr>
                      <th className="text-left px-4 py-3 font-mono text-sm text-neutral-400">{t("errors.code")}</th>
                      <th className="text-left px-4 py-3 font-mono text-sm text-neutral-400">{t("errors.status")}</th>
                      <th className="text-left px-4 py-3 font-mono text-sm text-neutral-400">{t("errors.description")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {ERROR_CODES.map((e) => (
                      <tr key={e.code}>
                        <td className={`px-4 py-3 font-mono text-sm font-bold ${e.color}`}>{e.code}</td>
                        <td className="px-4 py-3 font-mono text-sm text-white">{e.status}</td>
                        <td className="px-4 py-3 font-mono text-sm text-neutral-400">{e.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Examples */}
            <section id="examples" className="scroll-mt-20 space-y-6 pt-8 border-t border-neutral-800/50">
              <h2 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
                <Code className="w-6 h-6 text-purple-400" />
                {t("examples.title")}
              </h2>

              <div className="space-y-4">
                <div className="rounded-xl border border-neutral-800 overflow-hidden">
                  <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="font-mono text-sm text-neutral-400">JavaScript</span>
                  </div>
                  <CodeBlock code={`const API_KEY = process.env.BIO_API_KEY;

async function getProfile(username) {
  const res = await fetch(
    \`https://bio.lonestill.uk/api/v1/profile/\${username}\`,
    { headers: { Authorization: \`Bearer \${API_KEY}\` } }
  );
  return res.json();
}

const { data } = await getProfile("gitty");
console.log(data.displayName);`} />
                </div>

                <div className="rounded-xl border border-neutral-800 overflow-hidden">
                  <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <span className="font-mono text-sm text-neutral-400">Python</span>
                  </div>
                  <CodeBlock code={`import requests, os

API_KEY = os.environ["BIO_API_KEY"]

def get_profile(username):
    r = requests.get(
        f"https://bio.lonestill.uk/api/v1/profile/{username}",
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    return r.json()

data = get_profile("gitty")
print(data["data"]["displayName"])`} />
                </div>

                <div className="rounded-xl border border-neutral-800 overflow-hidden">
                  <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="font-mono text-sm text-neutral-400">cURL</span>
                  </div>
                  <CodeBlock code={`curl "https://bio.lonestill.uk/api/v1/profile/gitty" \\
  -H "Authorization: Bearer bio_xxxxx"

curl "https://bio.lonestill.uk/api/v1/users?limit=10&sort=views" \\
  -H "Authorization: Bearer bio_xxxxx"`} />
                </div>
              </div>
            </section>
            </div>

            {/* CTA */}
            <section className="pt-8 border-t border-neutral-800">
              <div className="p-6 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-mono font-bold text-white">{t("cta.title")}</h3>
                  <p className="text-neutral-400 font-mono text-sm mt-1">{t("cta.description")}</p>
                </div>
                <Link
                  href="/dashboard?tab=api"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono transition-all"
                >
                  <Key className="w-4 h-4" />
                  {t("cta.button")}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
