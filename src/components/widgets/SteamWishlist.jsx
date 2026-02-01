import { useState, useEffect } from "react";
import { Gamepad2, Clock, DollarSign, TrendingDown } from "lucide-react";

const CACHE_DURATION = 6 * 60 * 60 * 1000;

function getCachedSteamGames() {
  const cached = localStorage.getItem("steam_wishlist");
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
}

function setCachedSteamGames(data) {
  localStorage.setItem(
    "steam_wishlist",
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );
}

async function fetchSteamGames(ids) {
  const cache = getCachedSteamGames();
  if (cache) {
    return cache;
  }

  const response = await fetch(
    `https://www.cheapshark.com/api/1.0/games?ids=${ids.join(",")}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch steam games");
  }

  const data = await response.json();
  setCachedSteamGames(data);
  return data;
}

function SteamGameCard({ gameData }) {
  const info = gameData.info;
  const cheapest = gameData.cheapestPriceEver;
  const deals = gameData.deals || [];
  const steamDeal = deals.find((d) => d.storeID === "1");
  const currentPrice = steamDeal ? parseFloat(steamDeal.price) : null;
  const savings = steamDeal ? parseFloat(steamDeal.savings) : 0;
  const isOnSale = savings > 0;

  return (
    <a
      href={`https://store.steampowered.com/app/${info.steamAppID}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col p-4 rounded-xl hover:bg-white/20 dark:hover:bg-slate-700/20 transition-colors group"
    >
      {info.thumb && (
        <div className="w-full aspect-231/87 rounded-lg overflow-hidden shadow-md">
          <img
            src={info.thumb}
            alt={info.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="mt-3 text-center">
        <span className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-2">
          {info.title}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="text-gray-400">AppID:</span>
          <span>{info.steamAppID}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>史低: ${cheapest.price}</span>
        </span>
        {currentPrice !== null && (
          <>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className={isOnSale ? "text-green-500 font-medium" : ""}>
                ${currentPrice}
              </span>
            </span>
            {isOnSale && (
              <span className="flex items-center gap-1 text-green-500">
                <TrendingDown className="w-3 h-3" />
                <span>-{Math.round(savings)}%</span>
              </span>
            )}
          </>
        )}
      </div>
    </a>
  );
}

function SteamWishlist({ ids = [] }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getGames = async () => {
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchSteamGames(ids);
        setGames(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getGames();
  }, [ids]);

  if (loading) {
    return (
      <div>
        <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="w-6 h-6 text-gray-800 dark:text-white" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Steam 愿望单
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col p-4">
                <div className="w-full aspect-231/87 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-3 mx-auto"></div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || games.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 className="w-6 h-6 text-gray-800 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Steam 愿望单
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ids.map((id) => {
            const gameData = games[id];
            if (!gameData) return null;
            return <SteamGameCard key={id} gameData={gameData} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default SteamWishlist;
