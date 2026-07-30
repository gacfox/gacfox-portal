import { useState } from "react";
import Modal from "@/components/edit/Modal";
import { api } from "@/utils/api";

const inputClass =
  "w-full px-3 py-2 rounded-xl text-sm bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/60";

// PasswordModal 修改密码；成功后所有令牌失效，片刻后由 onSuccess 退出到登录页
export default function PasswordModal({ onSuccess, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }
    setSaving(true);
    try {
      await api("/account/password", {
        method: "PUT",
        body: { oldPassword, newPassword },
      });
      setDone(true);
      setTimeout(onSuccess, 1500);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title="修改密码" onClose={onClose}>
      {done ? (
        <p className="py-4 text-center text-sm text-green-600 dark:text-green-400">
          密码已修改，即将退出登录...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              原密码
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              新密码（至少 6 位）
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              确认新密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "提交中..." : "确认修改"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
