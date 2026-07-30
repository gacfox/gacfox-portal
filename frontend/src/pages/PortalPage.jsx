import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { api } from "@/utils/api";
import { useTheme } from "@/utils/useTheme";
import { useAuth } from "@/utils/useAuth";
import Header from "@/components/Header";
import WidgetRenderer from "@/components/widgets/WidgetRenderer";
import BookmarkCategory from "@/components/BookmarkCategory";
import BackToTop from "@/components/BackToTop";
import EditToolbar from "@/components/edit/EditToolbar";
import BookmarkFormModal from "@/components/edit/BookmarkFormModal";
import CategoryFormModal from "@/components/edit/CategoryFormModal";
import SiteSettingsModal from "@/components/edit/SiteSettingsModal";
import WidgetSettingsModal from "@/components/edit/WidgetSettingsModal";
import ConfirmDialog from "@/components/edit/ConfirmDialog";

function PortalPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState("");
  const { theme } = useTheme();
  const { logout } = useAuth();

  // 弹窗状态
  const [bookmarkModal, setBookmarkModal] = useState(null); // {categoryId, bookmark|null}
  const [categoryModal, setCategoryModal] = useState(null); // {category|null}
  const [confirm, setConfirm] = useState(null); // {message, action}
  const [showSiteSettings, setShowSiteSettings] = useState(false);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);

  const applySite = useCallback((data) => {
    setConfig(data);
    if (data?.site?.title) {
      document.title = data.site.title;
    }
  }, []);

  // 变更操作后重新拉取全量配置（数据量小，保证一致性的最简单方式）
  const load = useCallback(async () => {
    try {
      applySite(await api("/site"));
    } catch (err) {
      setToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [applySite]);

  useEffect(() => {
    api("/site")
      .then(applySite)
      .catch((err) => setToast(err.message))
      .finally(() => setLoading(false));
  }, [applySite]);

  // toast 自动消失
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 主题背景
  useEffect(() => {
    if (config?.site?.background) {
      const bgUrl =
        theme === "light"
          ? config.site.background.light
          : config.site.background.dark;
      if (bgUrl) {
        document.body.style.backgroundImage = `url('${bgUrl}')`;
      }
    }
  }, [config, theme]);

  // 执行变更操作后重新拉取全量配置（数据量小，保证一致性的最简单方式）
  const run = useCallback(
    async (action) => {
      try {
        await action();
        await load();
        return { ok: true };
      } catch (err) {
        setToast(err.message);
        return { ok: false, error: err.message };
      }
    },
    [load],
  );

  // ---- 书签操作 ----

  const saveBookmark = async (fields) => {
    const { categoryId, bookmark } = bookmarkModal;
    const res = await run(() =>
      bookmark
        ? api(`/bookmarks/${bookmark.id}`, { method: "PUT", body: fields })
        : api(`/categories/${categoryId}/bookmarks`, {
            method: "POST",
            body: fields,
          }),
    );
    if (res.ok) setBookmarkModal(null);
    else throw new Error(res.error); // 弹窗内联展示真实错误
  };

  const deleteBookmark = (bookmark) => {
    setConfirm({
      message: `确定删除链接「${bookmark.name}」吗？`,
      action: () => api(`/bookmarks/${bookmark.id}`, { method: "DELETE" }),
    });
  };

  const moveBookmark = (bookmark, direction) => {
    const apiDir = direction === "left" ? "up" : "down";
    run(() =>
      api(`/bookmarks/${bookmark.id}/move`, {
        method: "PUT",
        body: { direction: apiDir },
      }),
    );
  };

  // ---- 分类操作 ----

  const saveCategory = async (name) => {
    const { category } = categoryModal;
    const res = await run(() =>
      category
        ? api(`/categories/${category.id}`, {
            method: "PUT",
            body: { name },
          })
        : api("/categories", { method: "POST", body: { name } }),
    );
    if (res.ok) setCategoryModal(null);
    else throw new Error(res.error);
  };

  const deleteCategory = (category) => {
    setConfirm({
      message: `确定删除分类「${category.category}」吗？其中的 ${category.items?.length ?? 0} 个链接将一并删除。`,
      action: () => api(`/categories/${category.id}`, { method: "DELETE" }),
    });
  };

  const moveCategory = (category, direction) => {
    run(() =>
      api(`/categories/${category.id}/move`, {
        method: "PUT",
        body: { direction },
      }),
    );
  };

  // ---- 站点设置 / 小组件 ----

  const saveSite = async (site) => {
    const res = await run(() => api("/site", { method: "PUT", body: site }));
    if (res.ok) setShowSiteSettings(false);
    else throw new Error(res.error);
  };

  const saveWidgets = async (widgets) => {
    const res = await run(() =>
      api("/widgets", { method: "PUT", body: widgets }),
    );
    if (res.ok) setShowWidgetSettings(false);
    else throw new Error(res.error);
  };

  const confirmAction = async () => {
    const { action } = confirm;
    setConfirm(null);
    await run(action);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300 text-lg">
          Loading...
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300 text-lg">
          加载失败，请刷新重试
        </div>
      </div>
    );
  }

  const { site, bookmarks, widgets } = config;
  const categories = bookmarks || [];

  return (
    // 编辑模式下底部 fixed 工具条约占 90px，加大页面底部留白避免遮挡"添加分类"等内容
    <div className={`min-h-screen ${editMode ? "pb-36" : "pb-12"}`}>
      <Header
        title={site.title}
        icon={site.icon}
        editMode={editMode}
        onToggleEdit={() => setEditMode((v) => !v)}
        onLogout={logout}
      />

      <main className="pt-30">
        <WidgetRenderer config={widgets} />

        <div className="px-4 max-w-7xl mx-auto">
          <div className="w-full mt-6 space-y-6">
            {categories.map((category, index) => (
              <BookmarkCategory
                key={category.id ?? index}
                category={category}
                editMode={editMode}
                onEditBookmark={(bookmark) =>
                  setBookmarkModal({ categoryId: category.id, bookmark })
                }
                onDeleteBookmark={deleteBookmark}
                onMoveBookmark={moveBookmark}
                onAddBookmark={() =>
                  setBookmarkModal({ categoryId: category.id, bookmark: null })
                }
                onRenameCategory={() => setCategoryModal({ category })}
                onDeleteCategory={() => deleteCategory(category)}
                onMoveCategory={(dir) => moveCategory(category, dir)}
                isFirst={index === 0}
                isLast={index === categories.length - 1}
              />
            ))}

            {editMode && (
              <button
                onClick={() => setCategoryModal({ category: null })}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-3xl border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-gray-500 hover:border-blue-400 hover:text-blue-400 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm">添加分类</span>
              </button>
            )}

            {!editMode && categories.length === 0 && (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                暂无导航链接，点击右上角铅笔图标进入编辑模式添加
              </p>
            )}
          </div>
        </div>
      </main>

      <BackToTop />

      {editMode && (
        <EditToolbar
          onSiteSettings={() => setShowSiteSettings(true)}
          onWidgetSettings={() => setShowWidgetSettings(true)}
          onDone={() => setEditMode(false)}
        />
      )}

      {bookmarkModal && (
        <BookmarkFormModal
          bookmark={bookmarkModal.bookmark}
          onSave={saveBookmark}
          onClose={() => setBookmarkModal(null)}
        />
      )}

      {categoryModal && (
        <CategoryFormModal
          category={categoryModal.category}
          onSave={saveCategory}
          onClose={() => setCategoryModal(null)}
        />
      )}

      {showSiteSettings && (
        <SiteSettingsModal
          site={site}
          onSave={saveSite}
          onClose={() => setShowSiteSettings(false)}
        />
      )}

      {showWidgetSettings && (
        <WidgetSettingsModal
          widgets={widgets || []}
          onSave={saveWidgets}
          onClose={() => setShowWidgetSettings(false)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirmAction}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-red-500/90 text-white text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export default PortalPage;
