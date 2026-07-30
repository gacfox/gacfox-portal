import { useState } from "react";
import Modal from "@/components/edit/Modal";
import IconField from "@/components/edit/IconField";

// SiteSettingsModal 站点设置：标题、图标、明/暗背景图
export default function SiteSettingsModal({ site, onSave, onClose }) {
  const [title, setTitle] = useState(site?.title ?? "");
  const [icon, setIcon] = useState(site?.icon ?? "");
  const [bgLight, setBgLight] = useState(site?.background?.light ?? "");
  const [bgDark, setBgDark] = useState(site?.background?.dark ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        icon,
        background: { light: bgLight, dark: bgDark },
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title="站点设置" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            站点标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl text-sm bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/60"
          />
        </div>
        <IconField label="站点图标" value={icon} onChange={setIcon} />
        <IconField label="明亮主题背景" value={bgLight} onChange={setBgLight} />
        <IconField label="暗色主题背景" value={bgDark} onChange={setBgDark} />

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
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
