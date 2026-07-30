import { ChevronUp, ChevronDown, Pencil, Trash2, Plus } from "lucide-react";
import BookmarkCard from "@/components/BookmarkCard";

// BookmarkCategory 分类区块；editMode 下显示分类操作与"添加链接"卡片
export default function BookmarkCategory({
  category,
  editMode = false,
  onEditBookmark,
  onDeleteBookmark,
  onMoveBookmark,
  onAddBookmark,
  onRenameCategory,
  onDeleteCategory,
  onMoveCategory,
  isFirst = false,
  isLast = false,
}) {
  const { category: categoryName, items } = category;
  const bookmarks = items || [];

  if (!editMode && bookmarks.length === 0) {
    return null;
  }

  const iconBtn =
    "p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-slate-600/40 disabled:opacity-30 cursor-pointer disabled:cursor-default";

  return (
    <div className="w-full">
      <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {categoryName}
          </h2>
          {editMode && (
            <div className="flex items-center gap-1">
              <button
                onClick={onRenameCategory}
                className={iconBtn}
                title="重命名"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMoveCategory("up")}
                disabled={isFirst}
                className={iconBtn}
                title="上移"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMoveCategory("down")}
                disabled={isLast}
                className={iconBtn}
                title="下移"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={onDeleteCategory}
                className={`${iconBtn} hover:text-red-500`}
                title="删除分类"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {bookmarks.map((bookmark, index) => (
            <BookmarkCard
              key={bookmark.id ?? index}
              bookmark={bookmark}
              editMode={editMode}
              onEdit={() => onEditBookmark(bookmark)}
              onDelete={() => onDeleteBookmark(bookmark)}
              onMove={(dir) => onMoveBookmark(bookmark, dir)}
              isFirst={index === 0}
              isLast={index === bookmarks.length - 1}
            />
          ))}
          {editMode && (
            <button
              onClick={onAddBookmark}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-gray-500 hover:border-blue-400 hover:text-blue-400 transition-colors min-h-20 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">添加链接</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
