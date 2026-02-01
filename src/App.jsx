import { useState, useEffect } from "react";
import { loadConfig } from "@/utils/yamlLoader";
import { useTheme } from "@/utils/useTheme";
import Header from "@/components/Header";
import WidgetRenderer from "@/components/widgets/WidgetRenderer";
import BookmarkCategory from "@/components/BookmarkCategory";
import BackToTop from "@/components/BackToTop";

function App() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    loadConfig().then((data) => {
      setConfig(data);
      if (data?.site?.title) {
        document.title = data.site.title;
      }
      setLoading(false);
    });
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300 text-lg">
          Loading...
        </div>
      </div>
    );
  }

  const { site, bookmarks, widgets } = config;

  return (
    <div className="min-h-screen pb-12">
      <Header title={site.title} icon={site.icon} />

      <main className="pt-30">
        <WidgetRenderer config={widgets} />

        <div className="px-4 max-w-7xl mx-auto">
          {bookmarks && bookmarks.length > 0 && (
            <div className="w-full mt-6 space-y-6">
              {bookmarks.map((category, index) => (
                <BookmarkCategory key={index} category={category} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BackToTop />
    </div>
  );
}

export default App;
