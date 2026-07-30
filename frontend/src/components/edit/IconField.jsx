import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { api } from "@/utils/api";

// IconField 图片字段：URL 输入 + 本地上传 + 预览
export default function IconField({ label, value, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await api("/upload", { method: "POST", formData });
      onChange(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {value && (
          <img
            src={value}
            alt=""
            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-white/10"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="图片 URL 或上传"
          className="flex-1 min-w-0 px-3 py-2 rounded-xl text-sm bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/60"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="shrink-0 p-2 rounded-xl bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 cursor-pointer"
          title="上传图片"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/x-icon"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
      {uploading && (
        <p className="mt-1 text-xs text-gray-400">上传中...</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
