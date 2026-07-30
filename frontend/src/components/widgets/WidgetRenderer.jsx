import { useState, useEffect } from "react";
import TimeCard from "@/components/widgets/TimeCard";
import WeatherCard from "@/components/widgets/WeatherCard";
import GithubTrending from "@/components/widgets/GithubTrending";
import SeasonalAnime from "@/components/widgets/SeasonalAnime";
import SteamWishlist from "@/components/widgets/SteamWishlist";

const WIDGET_COMPONENTS = {
  time: TimeCard,
  weather: WeatherCard,
  "github-trending": GithubTrending,
  "seasonal-anime": SeasonalAnime,
  "steam-wishlist": SteamWishlist,
};

function WidgetRenderer({ config }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const widgets = Array.isArray(config) ? config : [];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6 px-4">
      {widgets.map((widget) => {
        const { name: widgetKey, gridWidth, ...extraProps } = widget;
        const WidgetComponent = WIDGET_COMPONENTS[widgetKey];
        if (!WidgetComponent) return null;

        const widthKey = isSmallScreen ? "full" : gridWidth || "full";
        const widthClass = widthKey === "half" ? "col-span-1" : "col-span-2";

        return (
          <div key={widgetKey} className={widthClass}>
            <WidgetComponent {...extraProps} />
          </div>
        );
      })}
    </div>
  );
}

export default WidgetRenderer;
