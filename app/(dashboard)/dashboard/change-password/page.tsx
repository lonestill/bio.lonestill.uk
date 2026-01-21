import { redirect } from "next/navigation";

export default function ChangePasswordPage() {
  redirect("/dashboard?tab=security");
}
