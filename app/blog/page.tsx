import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface ParsedPost {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  imageUrl?: string;
}

// Decode HTML entities
function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// Strip HTML tags and clean up text
function cleanText(html?: string): string {
  if (!html) return "";
  let text = decodeHtmlEntities(html);
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

// Extract image URL from description HTML - look for the actual image, not thumbnail
function extractImageUrl(html?: string): string | undefined {
  if (!html) return undefined;
  const decoded = decodeHtmlEntities(html);
  // Look for link to full image first (usually in <a href="...jpg">)
  const linkMatch = decoded.match(/<a[^>]+href=["']([^"']+\.(jpg|jpeg|png|gif|webp)[^"']*)["']/i);
  if (linkMatch?.[1]) return linkMatch[1];
  // Fallback to img src
  const imgMatch = decoded.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch?.[1];
}

function parseRss(xml: string, limit = 20): ParsedPost[] {
  const items: ParsedPost[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) && items.length < limit) {
    const itemXml = match[1];
    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>([^<]*)<\/title>/);
    const linkMatch = itemXml.match(/<link>([^<]*)<\/link>/);
    const dateMatch = itemXml.match(/<pubDate>([^<]*)<\/pubDate>/);
    const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/);

    const rawDesc = descMatch?.[1] || descMatch?.[2];
    const imageUrl = extractImageUrl(rawDesc);
    const cleanedDesc = cleanText(rawDesc);

    items.push({
      title: titleMatch?.[1] || titleMatch?.[2] || "",
      link: linkMatch?.[1] || "#",
      pubDate: dateMatch?.[1],
      description: cleanedDesc,
      imageUrl,
    });
  }

  return items;
}

async function getTelegramPosts() {
  const channel = "gittyblog";
  if (!channel) {
    return { error: "TELEGRAM_BLOG_CHANNEL не задан в env" };
  }

  try {
    const rssUrl = `https://tg.i-c-a.su/rss/${channel}`;
    const res = await fetch(rssUrl, { next: { revalidate: 300 } });
    if (!res.ok) {
      return { error: `Не удалось получить ленту (${res.status})` };
    }

    const xml = await res.text();
    const posts = parseRss(xml, 20);
    return { posts, channel };
  } catch (e) {
    return { error: "Ошибка при загрузке постов" };
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "вчера";
  } else if (diffDays < 7) {
    return `${diffDays} дн. назад`;
  }
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default async function BlogPage() {
  const data = await getTelegramPosts();

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-400 mb-2 font-mono">Блог</p>
            <h1 className="text-2xl md:text-3xl font-bold">Новости и обновления</h1>
            {"channel" in data && (
              <a 
                href={`https://t.me/${data.channel}`} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 mt-3 text-sm text-neutral-400 hover:text-purple-400 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.093.034.306.019.472z"/>
                </svg>
                @{data.channel}
              </a>
            )}
          </div>

          {"error" in data ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
              <p className="font-semibold text-red-300">{data.error}</p>
              <p className="text-sm text-neutral-400 mt-2">
                Укажите TELEGRAM_BLOG_CHANNEL в переменных окружения.
              </p>
            </div>
          ) : data.posts.length === 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-neutral-400 text-center">
              Постов пока нет.
            </div>
          ) : (
            <div className="space-y-4">
              {data.posts.map((post, idx) => (
                <article
                  key={`${post.link}-${idx}`}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm overflow-hidden hover:border-purple-500/20 transition-colors"
                >
                  {/* Image */}
                  {post.imageUrl && (
                    <a href={post.link} target="_blank" rel="noreferrer" className="block">
                      <img 
                        src={post.imageUrl} 
                        alt="" 
                        className="w-full max-h-[400px] object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </a>
                  )}
                  
                  {/* Content */}
                  <div className="p-4">
                    {/* Text */}
                    {post.description && (
                      <p className="text-[15px] text-neutral-200 leading-relaxed whitespace-pre-line">
                        {post.description}
                      </p>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800/50">
                      <span className="text-xs text-neutral-500 font-mono">
                        {formatDate(post.pubDate)}
                      </span>
                      <a
                        href={post.link || "#"}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-mono"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Открыть →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          {/* Subscribe CTA */}
          {"channel" in data && (
            <div className="mt-10 text-center">
              <a
                href={`https://t.me/${data.channel}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-colors text-purple-400 font-mono text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.093.034.306.019.472z"/>
                </svg>
                Подписаться на канал
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
