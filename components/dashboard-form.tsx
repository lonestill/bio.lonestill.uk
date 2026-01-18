"use client";

import { updateProfile } from "@/app/actions/update-profile";
import { useActionState } from "react";
import { Profile } from "@/db/schema";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface DashboardFormProps {
  profile: Profile;
}

export function DashboardForm({ profile }: DashboardFormProps) {
  const [state, formAction] = useActionState(updateProfile, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      // Refresh the page data after successful update
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <motion.form
      action={formAction}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl"
    >
      <div>
        <label htmlFor="displayName" className="block mb-2 text-sm font-mono text-neutral-300 uppercase tracking-wider">
          Display Name
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          defaultValue={profile.displayName || ""}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-white font-mono placeholder:text-neutral-600"
          placeholder="Your Display Name"
        />
      </div>

      <div>
        <label htmlFor="bioText" className="block mb-2 text-sm font-mono text-neutral-300 uppercase tracking-wider">
          Bio Text
        </label>
        <textarea
          id="bioText"
          name="bioText"
          rows={4}
          defaultValue={profile.bioText || ""}
          maxLength={500}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-white font-mono placeholder:text-neutral-600 resize-none"
          placeholder="Tell the world about yourself..."
        />
        <p className="text-xs font-mono text-neutral-500 mt-2">
          {(profile.bioText?.length || 0)}/500 characters
        </p>
      </div>

      <div>
        <label htmlFor="avatarUrl" className="block mb-2 text-sm font-mono text-neutral-300 uppercase tracking-wider">
          Avatar URL
        </label>
        <input
          type="url"
          id="avatarUrl"
          name="avatarUrl"
          defaultValue={profile.avatarUrl || ""}
          placeholder="https://example.com/avatar.png"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-white font-mono placeholder:text-neutral-600"
        />
      </div>

      <div>
        <label htmlFor="backgroundUrl" className="block mb-2 text-sm font-mono text-neutral-300 uppercase tracking-wider">
          Background URL <span className="text-neutral-500 text-xs normal-case">(Image or Video)</span>
        </label>
        <input
          type="url"
          id="backgroundUrl"
          name="backgroundUrl"
          defaultValue={profile.backgroundUrl || ""}
          placeholder="https://example.com/background.mp4"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-white font-mono placeholder:text-neutral-600"
        />
      </div>

      <div>
        <label htmlFor="musicUrl" className="block mb-2 text-sm font-mono text-neutral-300 uppercase tracking-wider">
          Music URL <span className="text-neutral-500 text-xs normal-case">(Optional)</span>
        </label>
        <input
          type="url"
          id="musicUrl"
          name="musicUrl"
          defaultValue={profile.modules?.music?.url || ""}
          placeholder="https://example.com/music.mp3"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-white font-mono placeholder:text-neutral-600"
        />
      </div>

      <input
        type="hidden"
        name="themeConfig"
        value={JSON.stringify(profile.themeConfig || {})}
      />

      {state?.error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono"
        >
          {state.error}
        </motion.div>
      )}

      {state?.success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm font-mono"
        >
          Profile updated successfully!
        </motion.div>
      )}

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-3 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 hover:border-purple-500/50 transition-all font-mono text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
      >
        UPDATE PROFILE
      </motion.button>
    </motion.form>
  );
}