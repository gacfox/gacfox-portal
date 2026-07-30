import { api } from "@/utils/api";
import { useAuth } from "@/utils/useAuth";
import AuthForm from "@/components/auth/AuthForm";

// InitPage 首次启动时创建管理员账号，成功后自动登录
export default function InitPage({ onDone }) {
  const { login } = useAuth();

  const handleInit = async (username, password) => {
    const data = await api("/init", {
      method: "POST",
      body: { username, password },
    });
    login(data.token);
    onDone();
  };

  return (
    <AuthForm
      title="欢迎使用导航门户"
      subtitle="首次启动，请创建管理员账号"
      submitText="初始化"
      onSubmit={handleInit}
    />
  );
}
