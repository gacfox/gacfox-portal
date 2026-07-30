import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Github, Pencil, Check, LogOut } from "lucide-react";
import { useTheme } from "@/utils/useTheme";

export default function Header({ title, icon, editMode, onToggleEdit, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const iconBtn =
    "p-2 rounded-full bg-white/15 dark:bg-slate-700/15 backdrop-blur-md hover:bg-opacity-60 transition-all duration-300 shadow-md cursor-pointer";

  return (
    <header
      className={`fixed left-0 w-full overflow-hidden top-4 z-40 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center px-6 py-3 rounded-2xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10">
          <div className="flex items-center gap-3">
            {icon && (
              <img
                src={icon}
                alt={title}
                className="w-8 h-8 rounded-lg object-cover"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleEdit}
              className={`${iconBtn} ${
                editMode ? "bg-blue-500/60 dark:bg-blue-500/40" : ""
              }`}
              aria-label="编辑模式"
              title={editMode ? "完成编辑" : "进入编辑模式"}
            >
              {editMode ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <Pencil className="w-6 h-6 text-gray-800 dark:text-white" />
              )}
            </button>
            <a
              href="https://github.com/gacfox/gacfox-portal"
              target="_blank"
              rel="noopener noreferrer"
              className={iconBtn}
              aria-label="GitHub"
            >
              <Github className="w-6 h-6 text-gray-800 dark:text-white" />
            </a>
            <button
              onClick={toggleTheme}
              className={iconBtn}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-6 h-6 text-gray-800" />
              ) : (
                <Sun className="w-6 h-6 text-yellow-400" />
              )}
            </button>
            <button
              onClick={onLogout}
              className={iconBtn}
              aria-label="退出登录"
              title="退出登录"
            >
              <LogOut className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
