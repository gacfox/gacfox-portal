import { ExternalLink } from "lucide-react";

export default function BookmarkCard({ bookmark }) {
  const { name, url, icon } = bookmark;
  const initial = name ? name.charAt(0).toUpperCase() : "";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 hover:bg-white/30 dark:hover:bg-slate-700/30 transition-all duration-300 shadow-lg hover:shadow-2xl"
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
        {icon ? (
          <img src={icon} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{initial}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-800 dark:text-white block truncate">
          {name}
        </span>
        {bookmark.description && (
          <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
            {bookmark.description}
          </span>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}
