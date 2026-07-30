import { useState, useEffect } from "react";
import { getStatus } from "@/utils/api";
import { useAuth } from "@/utils/useAuth";
import InitPage from "@/pages/InitPage";
import LoginPage from "@/pages/LoginPage";
import PortalPage from "@/pages/PortalPage";

// App 门禁：未初始化 → 初始化页；未登录 → 登录页；否则进入门户
function App() {
  const { token } = useAuth();
  const [initialized, setInitialized] = useState(null); // null = 加载中

  useEffect(() => {
    getStatus()
      .then((data) => setInitialized(data.initialized))
      .catch(() => setInitialized(false));
  }, []);

  if (initialized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300 text-lg">
          Loading...
        </div>
      </div>
    );
  }

  if (!initialized) {
    return <InitPage onDone={() => setInitialized(true)} />;
  }

  if (!token) {
    return <LoginPage />;
  }

  return <PortalPage />;
}

export default App;
