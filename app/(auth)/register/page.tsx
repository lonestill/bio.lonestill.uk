import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";

export default async function RegisterPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }
  
  // Регистрация закрыта - проект закрывается
  redirect("/");
}