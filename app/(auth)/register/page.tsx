import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }
  
  return <RegisterForm />;
}