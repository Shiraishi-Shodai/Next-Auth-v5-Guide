/**
 * ログインしていなくてもアクセスできるパスの配列
 * @type {string[]}
 */
export const publicRoutes = ["/", "/auth/new-verification"];

/**
 * 認証に使用されるパスの配列
 * これらのルートはユーザーがログイン後/settingへとリダイレクトされる
 * @type {string[]}
 */
export const authRoutes = ["/auth/login", "/auth/register", "/auth/error"];

/**
 * 認証用のapiプレフィックス
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * ログイン後にリダイレクトされるパス
 *@type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/settings";
