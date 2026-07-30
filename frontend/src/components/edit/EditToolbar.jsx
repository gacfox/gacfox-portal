import { Settings, LayoutGrid, KeyRound, Check } from "lucide-react";

// EditToolbar 编辑模式下固定在页面底部的操作栏
export default function EditToolbar({ onSiteSettings, onWidgetSettings, onChangePassword, onDone }) {
  const btn =
    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-200 bg-white/20 dark:bg-slate-700/30 hover:bg-white/40 dark:hover:bg-slate-600/40 transition-colors cursor-pointer";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)]">
      <div className="flex flex-wrap justify-center items-center gap-3 px-4 py-3 rounded-2xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 shadow-2xl">
        <button onClick={onSiteSettings} className={btn}>
          <Settings className="w-4 h-4" />
          站点设置
        </button>
        <button onClick={onWidgetSettings} className={btn}>
          <LayoutGrid className="w-4 h-4" />
          小组件
        </button>
        <button onClick={onChangePassword} className={btn}>
          <KeyRound className="w-4 h-4" />
          修改密码
        </button>
        <button
          onClick={onDone}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white bg-blue-500/80 hover:bg-blue-500 transition-colors cursor-pointer"
        >
          <Check className="w-4 h-4" />
          完成
        </button>
      </div>
    </div>
  );
}
