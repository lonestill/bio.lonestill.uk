import Link from "next/link";
import { getSession } from "@/lib/auth-utils";
import { HeaderClient } from "./header-client";

export async function Header() {
  const session = await getSession();
  
  return <HeaderClient isAuthenticated={!!session} />;
}
