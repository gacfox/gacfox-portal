const TOKEN_KEY = "gacfox_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// api 封装：自动携带 JWT，统一错误处理；401 时通知上层回到登录页
export async function api(path, { method = "GET", body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    // 已持有 token 时的 401 才视为会话过期（登录失败不应触发登出逻辑）
    if (getToken()) {
      onUnauthorized?.();
    }
    throw new Error(data.error || "登录已过期，请重新登录");
  }

  if (!res.ok) {
    throw new Error(data.error || `请求失败（${res.status}）`);
  }
  return data;
}

export async function getStatus() {
  const res = await fetch("/api/status");
  if (!res.ok) throw new Error("无法连接服务器");
  return res.json();
}
