import { getTranslations } from "next-intl/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FaqContent } from "@/components/faq-content";

export default async function FaqPage() {
  const t = await getTranslations("faq");

  const nav = t.raw("nav") as Record<string, string>;
  const sectionsRaw = t.raw("sections") as Record<string, any>;
  const showcase = t.raw("showcase") as {
    badges: { title: string; items: string[] };
    effects: { title: string; items: string[] };
    modules: { title: string; items: string[] };
    tip: { title: string; text: string };
  };
  const cta = t.raw("cta") as { title: string; subtitle: string; button: string };
  const hero = t.raw("hero") as { badge: string; title: string; subtitle: string };
  const quickLinks = t.raw("quickLinks") as { title: string; dashboard: string; apiDocs: string; support: string };

  const sections = Object.entries(sectionsRaw).map(([id, value]) => ({
    id,
    title: (value as any).title as string,
    items: Object.values((value as any).items) as Array<{ q: string; a: string }>,
  }));

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10">
        <Header />

        <FaqContent
          t={{
            hero,
            nav,
            sections,
            showcase,
            cta,
            quickLinks,
          }}
        />

        <Footer />
      </div>
    </main>
  );
}
