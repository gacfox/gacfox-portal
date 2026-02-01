import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Github } from "lucide-react";
import { useTheme } from "@/utils/useTheme";

export default function Header({ title, icon }) {
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

  return (
    <header
      className={`fixed left-0 w-full overflow-hidden top-4 transition-transform duration-300 ${
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
            <a
              href="https://github.com/gacfox/gacfox-portal"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/15 dark:bg-slate-700/15 backdrop-blur-md hover:bg-opacity-60 transition-all duration-300 shadow-md"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6 text-gray-800 dark:text-white" />
            </a>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/15 dark:bg-slate-700/15 backdrop-blur-md hover:bg-opacity-60 transition-all duration-300 shadow-md cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-6 h-6 text-gray-800" />
              ) : (
                <Sun className="w-6 h-6 text-yellow-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
