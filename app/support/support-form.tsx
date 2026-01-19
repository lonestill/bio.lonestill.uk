"use client";

import { useActionState } from "react";
import { createTicket } from "@/app/actions/support";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface SupportFormProps {
  userEmail?: string;
}

export function SupportForm({ userEmail = "" }: SupportFormProps) {
  const [state, formAction, isPending] = useActionState(createTicket, null);
  const t = useTranslations("support");

  const CATEGORIES = [
    { value: "ban_appeal", label: t("categories.banAppeal") },
    { value: "bug_report", label: t("categories.bugReport") },
    { value: "feature_request", label: t("categories.featureRequest") },
    { value: "account_issue", label: t("categories.accountIssue") },
    { value: "other", label: t("categories.other") },
  ];

  if (state?.success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-lg font-mono font-semibold text-white mb-2">
          {t("ticketSent")}
        </h3>
        <p className="text-sm text-neutral-400 font-mono mb-6">
          {t("willReply")}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 text-purple-400 font-mono text-sm transition-all"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Email */}
      <div>
        <label className="block text-sm font-mono text-neutral-400 mb-2">
          {t("emailForReply")} *
        </label>
        <input
          type="email"
          name="email"
          defaultValue={userEmail}
          required
          placeholder="your@email.com"
          className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-200 font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-purple-500/30 transition-colors"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-mono text-neutral-400 mb-2">
          {t("category")} *
        </label>
        <select
          name="category"
          required
          defaultValue=""
          className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-200 font-mono text-sm focus:outline-none focus:border-purple-500/30 transition-colors"
        >
          <option value="" disabled>
            {t("selectCategory")}
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-mono text-neutral-400 mb-2">
          {t("subject")} *
        </label>
        <input
          type="text"
          name="subject"
          required
          minLength={5}
          maxLength={200}
          placeholder={t("subjectPlaceholder")}
          className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-200 font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-purple-500/30 transition-colors"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-mono text-neutral-400 mb-2">
          {t("message")} *
        </label>
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          placeholder={t("messagePlaceholder")}
          className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-200 font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-purple-500/30 transition-colors resize-none"
        />
      </div>

      {/* Error */}
      {state?.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400 font-mono">{state.error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-mono font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t("send")}
          </>
        )}
      </button>

      <p className="text-[10px] text-neutral-600 font-mono text-center">
        {t("formConsent")}
      </p>
    </form>
  );
}
