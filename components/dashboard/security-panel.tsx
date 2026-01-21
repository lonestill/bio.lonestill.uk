import { Shield, KeyRound, LockKeyhole } from "lucide-react";
import { ChangePasswordForm } from "@/components/change-password-form";

export function SecurityPanel() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-mono font-semibold text-white">Безопасность</h2>
        </div>
        <p className="text-sm text-neutral-400 mt-2 font-mono">
          Управляйте безопасностью аккаунта и регулярно обновляйте пароль.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <LockKeyhole className="w-5 h-5 text-purple-300" />
            <h3 className="text-sm font-mono text-white">Советы по паролю</h3>
          </div>
          <ul className="text-sm text-neutral-400 space-y-2 list-disc list-inside font-mono">
            <li>Используйте длину 12+ символов</li>
            <li>Комбинируйте буквы, цифры и символы</li>
            <li>Не повторяйте пароли с других сервисов</li>
            <li>Меняйте пароль при подозрительной активности</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-purple-300" />
            <div>
              <h3 className="text-sm font-mono text-white">Смена пароля</h3>
              <p className="text-xs text-neutral-500 font-mono">Пароли хранятся в Argon2id, смена сбрасывает все активные сессии.</p>
            </div>
          </div>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
