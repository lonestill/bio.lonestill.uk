import { Header } from "@/components/header";
import { SupportForm } from "./support-form";
import { getUserTickets } from "@/app/actions/support";
import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { cookies } from "next/headers";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  open: { label: "Открыт", icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  in_progress: { label: "В работе", icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/10" },
  resolved: { label: "Решён", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
  closed: { label: "Закрыт", icon: XCircle, color: "text-neutral-400", bg: "bg-neutral-500/10" },
};

const CATEGORY_LABELS = {
  ban_appeal: "Апелляция бана",
  bug_report: "Баг-репорт",
  feature_request: "Предложение",
  account_issue: "Проблема с аккаунтом",
  other: "Другое",
};

export default async function SupportPage() {
  // Check if user is logged in
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const sessionId = sessionCookie?.value ?? null;

  let isLoggedIn = false;
  let userEmail = "";

  if (sessionId) {
    const { session, user } = await lucia.validateSession(sessionId);
    if (session && user) {
      isLoggedIn = true;
      userEmail = user.email || "";
    }
  }

  // Get user's tickets if logged in
  const tickets = isLoggedIn ? await getUserTickets() : [];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 mb-6">
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4">
              Поддержка
            </h1>
            <p className="text-neutral-400 font-mono max-w-lg mx-auto">
              Столкнулись с проблемой или есть предложение? Мы поможем!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-mono font-semibold text-white mb-6">
                Создать обращение
              </h2>
              <SupportForm userEmail={userEmail} />
            </div>

            {/* User's Tickets */}
            <div className="space-y-6">
              <h2 className="text-lg font-mono font-semibold text-white">
                {isLoggedIn ? "Ваши обращения" : "Информация"}
              </h2>

              {!isLoggedIn ? (
                <div className="glass rounded-2xl p-6">
                  <p className="text-neutral-400 text-sm font-mono mb-4">
                    Войдите в аккаунт, чтобы видеть историю своих обращений и получать ответы.
                  </p>
                  <p className="text-neutral-500 text-xs font-mono">
                    Вы всё равно можете отправить обращение без входа — ответ придёт на указанный email.
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="glass rounded-2xl p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-500 text-sm font-mono">
                    У вас пока нет обращений
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {tickets.map((ticket) => {
                    const status = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG];
                    const StatusIcon = status.icon;
                    const category = CATEGORY_LABELS[ticket.category as keyof typeof CATEGORY_LABELS];

                    return (
                      <div
                        key={ticket.id}
                        className="glass rounded-xl p-4 hover:border-purple-500/20 transition-colors"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-mono text-sm text-white truncate">
                              {ticket.subject}
                            </h3>
                            <span className="text-xs font-mono text-neutral-500">
                              {category}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${status.bg}`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${status.color} ${ticket.status === "in_progress" ? "animate-spin" : ""}`} />
                            <span className={`text-xs font-mono ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>

                        {/* Message preview */}
                        <p className="text-xs text-neutral-400 font-mono line-clamp-2 mb-3">
                          {ticket.message}
                        </p>

                        {/* Admin response */}
                        {ticket.adminResponse && (
                          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 mb-3">
                            <p className="text-xs font-mono text-neutral-500 mb-1">Ответ поддержки:</p>
                            <p className="text-sm text-neutral-300 font-mono">
                              {ticket.adminResponse}
                            </p>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600">
                          <Clock className="w-3 h-3" />
                          {ticket.createdAt
                            ? new Date(ticket.createdAt).toLocaleString("ru")
                            : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* FAQ */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-mono font-semibold text-white mb-4">
                  Частые вопросы
                </h3>
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <p className="text-purple-400 mb-1">Как долго ждать ответа?</p>
                    <p className="text-neutral-500">Обычно отвечаем в течение 24-48 часов</p>
                  </div>
                  <div>
                    <p className="text-purple-400 mb-1">Меня забанили, что делать?</p>
                    <p className="text-neutral-500">Выберите категорию "Апелляция бана" и опишите ситуацию</p>
                  </div>
                  <div>
                    <p className="text-purple-400 mb-1">Нашёл баг, куда писать?</p>
                    <p className="text-neutral-500">Выберите "Баг-репорт" и подробно опишите проблему</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
