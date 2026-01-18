"use client";

import { register } from "@/app/actions/auth";
import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function RegisterForm() {
  const [state, formAction] = useActionState(register, null);
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const usernameParam = searchParams.get('username');
    if (usernameParam) {
      setUsername(usernameParam);
    }
  }, [searchParams]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-[#050505]">
      {/* Background grid pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-mono font-bold mb-2 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent"
            >
              REGISTER
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-mono text-neutral-400"
            >
              Create your account
            </motion.p>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="username" className="block mb-2 text-sm font-mono text-neutral-300 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-white font-mono placeholder:text-neutral-600"
                placeholder="your_username"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="email" className="block mb-2 text-sm font-mono text-neutral-300 uppercase tracking-wider">
                Email <span className="text-neutral-500 text-xs normal-case">(Optional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-white font-mono placeholder:text-neutral-600"
                placeholder="your@email.com"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="password" className="block mb-2 text-sm font-mono text-neutral-300 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-white font-mono placeholder:text-neutral-600"
                placeholder="••••••••"
              />
            </motion.div>

            {state?.error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono"
              >
                {state.error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 hover:border-purple-500/50 transition-all font-mono text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
            >
              REGISTER
            </motion.button>
          </form>

          {/* Footer link */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-sm font-mono text-neutral-400"
          >
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="text-purple-400 hover:text-purple-300 transition-colors underline decoration-purple-500/50 hover:decoration-purple-400"
            >
              Login
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <RegisterForm />
    </Suspense>
  );
}