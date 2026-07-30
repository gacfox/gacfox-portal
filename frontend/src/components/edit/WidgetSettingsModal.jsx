import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import Modal from "@/components/edit/Modal";

// 可用小组件清单（与 WidgetRenderer 的 WIDGET_COMPONENTS 对应）
const AVAILABLE_WIDGETS = [
  { name: "time", label: "时钟" },
  { name: "weather", label: "天气" },
  { name: "github-trending", label: "GitHub Trending" },
  { name: "seasonal-anime", label: "当季番剧" },
  { name: "steam-wishlist", label: "Steam 愿望单" },
];

const labelOf = (name) =>
  AVAILABLE_WIDGETS.find((w) => w.name === name)?.label ?? name;

// WidgetSettingsModal 小组件管理：增删、排序、宽度与自定义参数（如 steam ids）
export default function WidgetSettingsModal({ widgets, onSave, onClose }) {
  const [list, setList] = useState(() =>
    widgets.map((w) => ({
      ...w,
      idsText: Array.isArray(w.ids) ? w.ids.join(", ") : "",
    })),
  );
  const [adding, setAdding] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addable = AVAILABLE_WIDGETS.filter(
    (w) => !list.some((item) => item.name === w.name),
  );

  const update = (index, patch) => {
    setList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    setList((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (index) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  const add = () => {
    if (!adding) return;
    setList((prev) => [
      ...prev,
      { name: adding, gridWidth: "full", idsText: "" },
    ]);
    setAdding("");
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const payload = list.map(({ name, gridWidth, idsText, ...rest }) => {
        const item = { name, gridWidth };
        if (name === "steam-wishlist") {
          item.ids = idsText
            .split(/[,，\s]+/)
            .map((s) => parseInt(s, 10))
            .filter((n) => !Number.isNaN(n));
        }
        // 其余自定义字段保留（未来扩展），丢弃服务端 id；
        // item 后放，确保编辑过的 ids 覆盖原始值
        const { id: _id, ...extra } = rest;
        return { ...extra, ...item };
      });
      await onSave(payload);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const iconBtn =
    "p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-default";

  return (
    <Modal title="小组件管理" onClose={onClose} wide>
      <div className="space-y-3">
        {list.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-2">
            暂无小组件，从下方添加
          </p>
        )}
        {list.map((widget, index) => (
          <div
            key={widget.name}
            className="rounded-xl bg-gray-50 dark:bg-slate-700/40 border border-gray-200 dark:border-white/10 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {labelOf(widget.name)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className={iconBtn}
                  title="上移"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === list.length - 1}
                  className={iconBtn}
                  title="下移"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(index)}
                  className={`${iconBtn} hover:text-red-500`}
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>宽度</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                {[
                  { value: "full", label: "全宽" },
                  { value: "half", label: "半宽" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update(index, { gridWidth: opt.value })}
                    className={`px-3 py-1 cursor-pointer ${
                      widget.gridWidth === opt.value
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {widget.name === "steam-wishlist" && (
              <input
                type="text"
                value={widget.idsText}
                onChange={(e) => update(index, { idsText: e.target.value })}
                placeholder="Steam AppID，逗号分隔"
                className="mt-2 w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/60"
              />
            )}
          </div>
        ))}
      </div>

      {addable.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <select
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl text-sm bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white focus:outline-none"
          >
            <option value="">选择要添加的小组件...</option>
            {addable.map((w) => (
              <option key={w.name} value={w.name}>
                {w.label}
              </option>
            ))}
          </select>
          <button
            onClick={add}
            disabled={!adding}
            className="p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 cursor-pointer"
            title="添加"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </Modal>
  );
}
