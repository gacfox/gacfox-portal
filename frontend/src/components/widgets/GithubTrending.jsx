import { useState, useEffect } from "react";
import { Github, Star } from "lucide-react";

const CACHE_DURATION = 6 * 60 * 60 * 1000;

function getCachedTrending() {
  const cached = localStorage.getItem("github_trending");
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
}

function setCachedTrending(data) {
  localStorage.setItem(
    "github_trending",
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );
}

async function fetchTrending() {
  const cache = getCachedTrending();
  if (cache) {
    return cache;
  }

  const date = new Date();
  date.setDate(date.getDate() - 30);
  const dateStr = date.toISOString().split("T")[0];

  const response = await fetch(
    `https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trending");
  }

  const data = await response.json();
  setCachedTrending(data);
  return data;
}

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Vue: "#41b883",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Dockerfile: "#384d54",
};

function GithubTrending() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTrending = async () => {
      try {
        const data = await fetchTrending();
        setTrending(data.items || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getTrending();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Github className="w-6 h-6 text-gray-800 dark:text-white" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              GitHub Trending
            </h2>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || trending.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Github className="w-6 h-6 text-gray-800 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            GitHub Trending
          </h2>
        </div>
        <div className="max-h-62.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-2">
            {trending.slice(0, 10).map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/20 dark:hover:bg-slate-700/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  <Github className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                      {repo.name}
                    </span>
                    {repo.language && (
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            LANGUAGE_COLORS[repo.language] || "#8b8b8b",
                        }}
                        title={repo.language}
                      ></span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{repo.stargazers_count.toLocaleString()}</span>
                    </div>
                    <span className="truncate max-w-50">{repo.full_name}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GithubTrending;
