"use client";

import { useState } from "react";
import { Eye, TrendingUp, Loader2, Check, AlertCircle } from "lucide-react";
import {
  boostUniqueViews,
  boostSimpleViews,
  getUserViewsDetails,
  getAllUsers,
} from "@/app/actions/admin";

interface User {
  id: string;
  uid: number | null;
  username: string;
  email: string | null;
  role: string;
  badges: any;
  createdAt: Date;
  displayName: string | null;
  avatarUrl: string | null;
  views: number | null;
}

interface ViewsDetails {
  profile: {
    userId: string;
    displayName: string | null;
    views: number;
  };
  uniqueViewsCount: number;
  simpleViewsCount: number;
  recentViews: Array<{
    visitorHash: string;
    viewedAt: Date;
  }>;
}

export function ViewsBoostPanel() {
  const [activeTab, setActiveTab] = useState<"boost" | "check">("boost");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [viewsDetails, setViewsDetails] = useState<ViewsDetails | null>(null);
  const [amount, setAmount] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [usersLoaded, setUsersLoaded] = useState(false);

  // Load users list
  const loadUsers = async () => {
    if (usersLoaded) return;
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setUsersLoaded(true);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Ошибка загрузки пользователей",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load views details for selected user
  const loadViewsDetails = async () => {
    if (!selectedUserId) {
      setMessage({
        type: "error",
        text: "Выберите пользователя",
      });
      return;
    }

    try {
      setLoading(true);
      const details = await getUserViewsDetails(selectedUserId);
      setViewsDetails(details);
      setMessage(null);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Ошибка загрузки данных",
      });
    } finally {
      setLoading(false);
    }
  };

  // Boost unique views
  const handleBoostUnique = async () => {
    if (!selectedUserId) {
      setMessage({
        type: "error",
        text: "Выберите пользователя",
      });
      return;
    }

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({
        type: "error",
        text: "Введите корректное количество",
      });
      return;
    }

    try {
      setLoading(true);
      await boostUniqueViews(selectedUserId, numAmount);
      setMessage({
        type: "success",
        text: `✓ Добавлено ${numAmount} уникальных просмотров`,
      });
      setAmount("10");
      // Refresh details
      await loadViewsDetails();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Ошибка при добавлении просмотров",
      });
    } finally {
      setLoading(false);
    }
  };

  // Boost simple views
  const handleBoostSimple = async () => {
    if (!selectedUserId) {
      setMessage({
        type: "error",
        text: "Выберите пользователя",
      });
      return;
    }

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({
        type: "error",
        text: "Введите корректное количество",
      });
      return;
    }

    try {
      setLoading(true);
      await boostSimpleViews(selectedUserId, numAmount);
      setMessage({
        type: "success",
        text: `✓ Добавлено ${numAmount} просмотров`,
      });
      setAmount("10");
      // Refresh details
      await loadViewsDetails();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Ошибка при добавлении просмотров",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-800">
        <button
          onClick={() => {
            setActiveTab("boost");
            loadUsers();
          }}
          className={`px-4 py-3 font-mono text-sm transition-colors ${
            activeTab === "boost"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-neutral-400 hover:text-neutral-300"
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Накрутка просмотров
        </button>
        <button
          onClick={() => {
            setActiveTab("check");
            loadUsers();
          }}
          className={`px-4 py-3 font-mono text-sm transition-colors ${
            activeTab === "check"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-neutral-400 hover:text-neutral-300"
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Проверка просмотров
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-mono text-sm">{message.text}</span>
        </div>
      )}

      {/* Boost Tab */}
      {activeTab === "boost" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-mono text-neutral-400">
              Выберите пользователя
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setViewsDetails(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-red-500/50 disabled:opacity-50"
              >
                <option value="">-- Выберите пользователя --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.displayName || "Без имени"})
                  </option>
                ))}
              </select>
              <button
                onClick={loadUsers}
                disabled={loading || usersLoaded}
                className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors disabled:opacity-50 font-mono text-sm"
              >
                {loading ? "⟳" : "↺"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-mono text-neutral-400">
              Количество
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              disabled={loading}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-red-500/50 disabled:opacity-50"
              placeholder="10"
            />
          </div>

          {/* Boost Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleBoostUnique}
              disabled={loading || !selectedUserId}
              className="px-4 py-3 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500/30 hover:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              Уникальные просмотры
            </button>
            <button
              onClick={handleBoostSimple}
              disabled={loading || !selectedUserId}
              className="px-4 py-3 bg-orange-500/20 border border-orange-500/50 rounded-lg hover:bg-orange-500/30 hover:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              Простые просмотры
            </button>
          </div>

          {/* Info */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 space-y-2">
            <p className="text-xs font-mono text-neutral-400">
              <strong>Уникальные просмотры:</strong> каждый добавляется как отдельный просмотр в profileViews (более реалистично)
            </p>
            <p className="text-xs font-mono text-neutral-400">
              <strong>Простые просмотры:</strong> просто увеличивают счетчик views в профиле
            </p>
          </div>
        </div>
      )}

      {/* Check Tab */}
      {activeTab === "check" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-mono text-neutral-400">
              Выберите пользователя
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setViewsDetails(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-red-500/50 disabled:opacity-50"
              >
                <option value="">-- Выберите пользователя --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.displayName || "Без имени"})
                  </option>
                ))}
              </select>
              <button
                onClick={loadViewsDetails}
                disabled={loading || !selectedUserId}
                className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors disabled:opacity-50 font-mono text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  "Загрузить"
                )}
              </button>
            </div>
          </div>

          {/* Views Details */}
          {viewsDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
                  <p className="text-xs font-mono text-neutral-400 mb-1">
                    Уникальные просмотры
                  </p>
                  <p className="text-2xl font-mono font-bold text-blue-400">
                    {viewsDetails.uniqueViewsCount}
                  </p>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
                  <p className="text-xs font-mono text-neutral-400 mb-1">
                    Простые просмотры
                  </p>
                  <p className="text-2xl font-mono font-bold text-orange-400">
                    {viewsDetails.simpleViewsCount}
                  </p>
                </div>
              </div>

              {/* Recent Views */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
                <h3 className="font-mono font-bold text-sm text-white mb-3">
                  Последние 20 просмотров
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {viewsDetails.recentViews.length > 0 ? (
                    viewsDetails.recentViews.map((view, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 px-3 bg-neutral-800/30 rounded border border-neutral-700/30 text-xs font-mono"
                      >
                        <span className="text-neutral-400 truncate">
                          {view.visitorHash}
                        </span>
                        <span className="text-neutral-500 whitespace-nowrap ml-2">
                          {new Date(view.viewedAt).toLocaleString("ru-RU")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-500 text-xs">Нет просмотров</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
