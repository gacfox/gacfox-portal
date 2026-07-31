import { useState } from "react";
import Modal from "@/components/edit/Modal";
import IconField from "@/components/edit/IconField";

const inputClass =
  "w-full px-3 py-2 rounded-xl text-sm bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/60";

// BookmarkFormModal 新建/编辑书签，bookmark 为 null 时表示新建；
// 可通过"所属分类"下拉框把书签移动（或创建）到其它分类
export default function BookmarkFormModal({ bookmark, categories = [], categoryId, onSave, onClose }) {
  const [name, setName] = useState(bookmark?.name ?? "");
  const [url, setUrl] = useState(bookmark?.url ?? "");
  const [icon, setIcon] = useState(bookmark?.icon ?? "");
  const [description, setDescription] = useState(bookmark?.description ?? "");
  const [targetCategoryId, setTargetCategoryId] = useState(categoryId);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        url: url.trim(),
        icon,
        description,
        categoryId: targetCategoryId,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title={bookmark ? "编辑链接" : "添加链接"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            名称
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        {categories.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              所属分类
            </label>
            <select
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(Number(e.target.value))}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            链接
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            required
            className={inputClass}
          />
        </div>
        <IconField label="图标" value={icon} onChange={setIcon} />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            描述
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
