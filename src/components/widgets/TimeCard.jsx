import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function TimeCard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
      date.getDay()
    ];
    return { year, month, day, dayOfWeek };
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const { year, month, day, dayOfWeek } = formatDate(time);

  return (
    <div>
      <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-white/20 dark:bg-slate-700/20">
              <Clock className="w-8 h-8 text-gray-800 dark:text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-800 dark:text-white font-mono">
                  {formatTime(time)}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {year}年{month}月{day}日 {dayOfWeek}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeCard;
