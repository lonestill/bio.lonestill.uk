"use client";

import { useState, useRef, useEffect } from "react";
import { changePassword } from "@/app/actions/auth";

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        formRef.current?.reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await changePassword(null, formData);

    if (result.success) {
      setSuccess(true);
      formRef.current?.reset();
    } else {
      setError(result.error || "Failed to change password");
    }

    setIsLoading(false);
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-200 text-sm">
          Пароль успешно изменен
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="block text-sm font-mono text-neutral-300">
            Текущий пароль
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl bg-neutral-900/60 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Введите текущий пароль"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="newPassword" className="block text-sm font-mono text-neutral-300">
            Новый пароль
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl bg-neutral-900/60 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Минимум 8 символов"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-mono text-neutral-300">
            Подтверждение пароля
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl bg-neutral-900/60 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Повторите новый пароль"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/50 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {isLoading ? "Меняем пароль..." : "Сменить пароль"}
        </button>
      </form>
    </div>
  );
}
