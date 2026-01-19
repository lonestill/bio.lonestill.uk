import Link from "next/link";
import { getSession } from "@/lib/auth-utils";
import { HeaderClient } from "./header-client";
import { getLocale } from "next-intl/server";

export async function Header() {
  const session = await getSession();
  const locale = await getLocale();
  
  return <HeaderClient isAuthenticated={!!session} currentLocale={locale} />;
}
