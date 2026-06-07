export const corsMessage =
  "当前 API 地址可能不允许浏览器跨域访问。纯前端模式无法绕过 CORS。请更换支持 CORS 的 API 地址，或使用你信任的中转服务。";

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

export function getReadableError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "已停止生成。";
  }

  if (error instanceof TypeError) {
    return `${corsMessage} 原始错误：${error.message}`;
  }

  if (error instanceof Error) {
    return error.message || "请求失败。";
  }

  return "请求失败。";
}

export function getHttpErrorMessage(status: number, bodyText?: string) {
  const suffix = bodyText ? ` 服务返回：${bodyText.slice(0, 600)}` : "";
  if (status === 401) {
    return `401 Unauthorized：API Key 无效或缺少授权。${suffix}`;
  }
  if (status === 403) {
    return `403 Forbidden：当前 Key 或账号没有访问权限。${suffix}`;
  }
  if (status === 429) {
    return `429 Too Many Requests：请求过于频繁或额度不足。${suffix}`;
  }
  if (status >= 500) {
    return `${status} 服务端错误：模型服务暂时不可用。${suffix}`;
  }
  return `${status} 请求失败。${suffix}`;
}
