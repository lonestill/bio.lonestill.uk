import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }
  
  return <LoginForm />;
}