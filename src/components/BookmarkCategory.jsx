import BookmarkCard from "@/components/BookmarkCard";

export default function BookmarkCategory({ category }) {
  const { category: categoryName, items } = category;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 px-2">
          {categoryName}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((bookmark, index) => (
            <BookmarkCard key={index} bookmark={bookmark} />
          ))}
        </div>
      </div>
    </div>
  );
}
