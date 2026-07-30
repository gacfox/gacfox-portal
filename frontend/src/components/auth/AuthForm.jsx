import { useState, useEffect } from "react";

// AuthForm 初始化/登录共用的认证表单，沿用门户的毛玻璃视觉风格
export default function AuthForm({ title, subtitle, submitText, onSubmit }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 认证页使用默认背景
  useEffect(() => {
    const prev = document.body.style.backgroundImage;
    document.body.style.backgroundImage = "url('/default-background.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    return () => {
      document.body.style.backgroundImage = prev;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-slate-700/30 border border-white/20 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60";

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
          {title}
        </h1>
        <p className="mt-2 mb-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          {subtitle}
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名"
            autoComplete="username"
            required
            className={inputClass}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码（至少 6 位）"
            autoComplete="current-password"
            required
            minLength={6}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500 dark:text-red-400 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full py-3 rounded-xl bg-blue-500/80 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "提交中..." : submitText}
        </button>
      </form>
    </div>
  );
}
