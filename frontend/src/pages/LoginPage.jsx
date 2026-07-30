import { api } from "@/utils/api";
import { useAuth } from "@/utils/useAuth";
import AuthForm from "@/components/auth/AuthForm";

// LoginPage 登录页，成功后由 App 门禁切换到门户
export default function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (username, password) => {
    const data = await api("/login", {
      method: "POST",
      body: { username, password },
    });
    login(data.token);
  };

  return (
    <AuthForm
      title="导航门户"
      subtitle="请登录以继续"
      submitText="登录"
      onSubmit={handleLogin}
    />
  );
}
