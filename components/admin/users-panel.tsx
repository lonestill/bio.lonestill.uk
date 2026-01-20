"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getAllUsers,
  updateUserRole,
  updateUserBadges,
  deleteUser,
  createUser,
  updateUser,
  resetUserViews,
  banUser,
  unbanUser,
  invalidateUserSessions,
} from "@/app/actions/admin";
import { BadgeType } from "@/db/schema";
import {
  Users,
  Search,
  Loader2,
  Shield,
  Crown,
  User,
  Trash2,
  Edit,
  Eye,
  Ban,
  RefreshCw,
  Plus,
  X,
  Check,
  AlertTriangle,
  LogOut,
  Award,
  Bug,
  Terminal,
  Sparkles,
  Server,
} from "lucide-react";

interface UserData {
  id: string;
  uid: number | null;
  username: string;
  email: string | null;
  role: string;
  badges: BadgeType[] | null;
  createdAt: Date | null;
  displayName: string | null;
  avatarUrl: string | null;
  views: number | null;
}

const BADGE_INFO: Record<BadgeType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  bughunter: { label: "Bug Hunter", icon: Bug },
  hacker: { label: "Hacker", icon: Terminal },
  early_adopter: { label: "Early Adopter", icon: Sparkles },
  premium: { label: "Premium", icon: Crown },
  localhost: { label: "Localhost", icon: Server },
  hello_kitty: { label: "Hello Kitty", icon: Award },
};

export function UsersPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
  });
  const [selectedBadges, setSelectedBadges] = useState<BadgeType[]>([]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to update role:", error);
        alert(error instanceof Error ? error.message : "Ошибка обновления роли");
      }
    });
  };

  const handleDeleteUser = async (userId: string) => {
    startTransition(async () => {
      try {
        await deleteUser(userId);
        setConfirmDelete(null);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert(error instanceof Error ? error.message : "Ошибка удаления");
      }
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createUser(newUserForm);
        setIsCreating(false);
        setNewUserForm({ username: "", email: "", password: "", role: "user" });
        await fetchUsers();
      } catch (error) {
        console.error("Failed to create user:", error);
        alert(error instanceof Error ? error.message : "Ошибка создания пользователя");
      }
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    startTransition(async () => {
      try {
        await updateUser(selectedUser.id, {
          username: editForm.username || undefined,
          email: editForm.email,
          password: editForm.password || undefined,
          displayName: editForm.displayName,
        });
        setIsEditing(false);
        setSelectedUser(null);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to update user:", error);
        alert(error instanceof Error ? error.message : "Ошибка обновления");
      }
    });
  };

  const handleUpdateBadges = async () => {
    if (!selectedUser) return;

    startTransition(async () => {
      try {
        await updateUserBadges(selectedUser.id, selectedBadges);
        setShowBadgesModal(false);
        setSelectedUser(null);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to update badges:", error);
        alert(error instanceof Error ? error.message : "Ошибка обновления бейджей");
      }
    });
  };

  const handleResetViews = async (userId: string) => {
    startTransition(async () => {
      try {
        await resetUserViews(userId);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to reset views:", error);
        alert(error instanceof Error ? error.message : "Ошибка сброса просмотров");
      }
    });
  };

  const handleBanUser = async (userId: string, deleteAccount: boolean = false) => {
    startTransition(async () => {
      try {
        await banUser(userId, deleteAccount);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to ban user:", error);
        alert(error instanceof Error ? error.message : "Ошибка бана пользователя");
      }
    });
  };

  const handleUnbanUser = async (userId: string) => {
    startTransition(async () => {
      try {
        await unbanUser(userId);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to unban user:", error);
        alert(error instanceof Error ? error.message : "Ошибка разбана");
      }
    });
  };

  const handleKickSessions = async (userId: string) => {
    startTransition(async () => {
      try {
        await invalidateUserSessions(userId);
        alert("Все сессии пользователя завершены");
      } catch (error) {
        console.error("Failed to invalidate sessions:", error);
        alert(error instanceof Error ? error.message : "Ошибка завершения сессий");
      }
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4 text-red-400" />;
      case "premium":
        return <Crown className="w-4 h-4 text-amber-400" />;
      case "banned":
        return <Ban className="w-4 h-4 text-neutral-500" />;
      default:
        return <User className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "premium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "banned":
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-semibold text-white">Пользователи</h2>
            <p className="text-sm font-mono text-neutral-500">
              Всего: {users.length} пользователей
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 font-mono text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Создать пользователя
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input
          type="text"
          placeholder="Поиск по имени, email или никнейму..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-200 font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-red-500/30 transition-colors"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-900/50 border-b border-neutral-800">
                <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Бейджи
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Просмотры
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-4 py-3 text-right text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-neutral-900/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                          <User className="w-5 h-5 text-neutral-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-mono text-sm text-neutral-200">
                          {user.displayName || user.username}
                        </div>
                        <div className="text-xs font-mono text-neutral-500">
                          @{user.username} • UID: {user.uid || "N/A"}
                        </div>
                        {user.email && (
                          <div className="text-xs font-mono text-neutral-600">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isPending}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium ${getRoleBadge(
                        user.role
                      )} bg-transparent cursor-pointer focus:outline-none`}
                    >
                      <option value="user">User</option>
                      <option value="premium">Premium</option>
                      <option value="admin">Admin</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {user.badges && user.badges.length > 0 ? (
                        user.badges.map((badge) => {
                          const info = BADGE_INFO[badge];
                          const Icon = info?.icon;
                          return (
                            <span
                              key={badge}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-xs font-mono"
                              title={info?.label}
                            >
                              {Icon && <Icon className="w-3 h-3" />}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-neutral-600">—</span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedBadges(user.badges || []);
                          setShowBadgesModal(true);
                        }}
                        className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors"
                        title="Управление бейджами"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-neutral-600" />
                      <span className="font-mono text-sm text-neutral-400">
                        {(user.views || 0).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-mono text-neutral-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("ru")
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setEditForm({
                            username: user.username,
                            email: user.email || "",
                            password: "",
                            displayName: user.displayName || "",
                          });
                          setIsEditing(true);
                        }}
                        className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-blue-400 transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetViews(user.id)}
                        className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-amber-400 transition-colors"
                        title="Сбросить просмотры"
                        disabled={isPending}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleKickSessions(user.id)}
                        className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-orange-400 transition-colors"
                        title="Завершить все сессии"
                        disabled={isPending}
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                      {user.role === "banned" ? (
                        <button
                          onClick={() => handleUnbanUser(user.id)}
                          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-green-400 transition-colors"
                          title="Разбанить"
                          disabled={isPending}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-red-400 transition-colors"
                          title="Забанить"
                          disabled={isPending}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(user.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                        title="Удалить"
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-mono font-semibold text-white">
                Создать пользователя
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-neutral-400 mb-2">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  value={newUserForm.username}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, username: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-neutral-400 mb-2">
                  Email (опционально)
                </label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-neutral-400 mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, password: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-neutral-400 mb-2">
                  Роль
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, role: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="user">User</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Создать"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-mono font-semibold text-white">
                Редактировать @{selectedUser.username}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedUser(null);
                }}
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-neutral-400 mb-2">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-neutral-400 mb-2">
                  Отображаемое имя
                </label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, displayName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-neutral-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-neutral-400 mb-2">
                  Новый пароль (оставьте пустым, чтобы не менять)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Сохранить"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Badges Modal */}
      {showBadgesModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-mono font-semibold text-white">
                Бейджи @{selectedUser.username}
              </h3>
              <button
                onClick={() => {
                  setShowBadgesModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {(Object.keys(BADGE_INFO) as BadgeType[]).map((badge) => {
                const info = BADGE_INFO[badge];
                const Icon = info.icon;
                const isSelected = selectedBadges.includes(badge);

                return (
                  <button
                    key={badge}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedBadges(selectedBadges.filter((b) => b !== badge));
                      } else {
                        setSelectedBadges([...selectedBadges, badge]);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                        : "bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-mono text-sm">{info.label}</span>
                    {isSelected && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleUpdateBadges}
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Сохранить"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-red-500/20 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-semibold text-white">
                  Удалить пользователя?
                </h3>
                <p className="text-sm text-neutral-500">Это действие необратимо</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDelete)}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Удалить"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
