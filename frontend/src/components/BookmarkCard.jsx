import { ExternalLink, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

// BookmarkCard 书签卡片；editMode 下点击打开编辑弹窗，并显示移动/删除按钮
export default function BookmarkCard({
  bookmark,
  editMode = false,
  onEdit,
  onDelete,
  onMove,
  isFirst = false,
  isLast = false,
}) {
  const { name, url, icon } = bookmark;
  const initial = name ? name.charAt(0).toUpperCase() : "";

  const body = (
    <>
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
      {!editMode && (
        <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </>
  );

  const baseClass =
    "group relative flex items-center gap-4 p-4 rounded-2xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 transition-all duration-300 shadow-lg";

  if (editMode) {
    const editBtn =
      "p-1 rounded-lg bg-white/30 dark:bg-slate-600/40 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-default";
    return (
      <div
        onClick={onEdit}
        className={`${baseClass} cursor-pointer ring-1 ring-blue-400/40 hover:bg-white/30 dark:hover:bg-slate-700/30`}
      >
        {body}
        <div
          className="absolute -top-2 -right-2 flex gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onMove("left")}
            disabled={isFirst}
            className={editBtn}
            title="左移"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove("right")}
            disabled={isLast}
            className={editBtn}
            title="右移"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className={`${editBtn} hover:text-red-500`}
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClass} hover:bg-white/30 dark:hover:bg-slate-700/30 hover:shadow-2xl`}
    >
      {body}
    </a>
  );
}
