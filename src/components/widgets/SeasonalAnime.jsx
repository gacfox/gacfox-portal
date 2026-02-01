import { useState, useEffect } from "react";
import { Star } from "lucide-react";

const CACHE_DURATION = 6 * 60 * 60 * 1000;

function getCachedAnime() {
  const cached = localStorage.getItem("seasonal_anime");
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
}

function setCachedAnime(data) {
  localStorage.setItem(
    "seasonal_anime",
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );
}

async function fetchAnime() {
  const cache = getCachedAnime();
  if (cache) {
    return cache;
  }

  const response = await fetch(`https://api.jikan.moe/v4/seasons/now?limit=25`);

  if (!response.ok) {
    throw new Error("Failed to fetch anime");
  }

  const data = await response.json();
  setCachedAnime(data);
  return data;
}

function AnimeCard({ anime }) {
  const imageUrl = anime.images?.webp?.image_url;
  const titleJa = anime.title_japanese;
  const titleEn = anime.title_english;
  const rating = anime.rating;
  const score = anime.score;

  return (
    <a
      href={anime.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 p-3 rounded-xl hover:bg-white/20 dark:hover:bg-slate-700/20 transition-colors group"
    >
      {imageUrl && (
        <div className="w-22.5 h-31.75 shrink-0 rounded-lg overflow-hidden shadow-md">
          <img
            src={imageUrl}
            alt={titleEn || titleJa}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {titleJa && (
          <span className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors">
            {titleJa}
          </span>
        )}
        {titleEn && titleEn !== titleJa && (
          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {titleEn}
          </span>
        )}
        {rating && (
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {rating}
          </span>
        )}
        {score && (
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {score}
            </span>
          </div>
        )}
      </div>
    </a>
  );
}

function SeasonalAnime() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAnime = async () => {
      try {
        const data = await fetchAnime();
        setAnimeList(data.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getAnime();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 p-3">
                <div className="w-22.5 h-31.75 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || animeList.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded bg-pink-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">番</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            当季番剧
          </h2>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2 pb-2">
            {animeList.slice(0, 25).map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeasonalAnime;
