import { loginApi, registerApi } from '@/api/auth.api'
import { setToken, removeToken } from '@/utils/token'
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  AuthUser,
} from '@/types/auth'

/**
 * Login service:
 * 1. Call the login API
 * 2. Persist the returned tokens
 * 3. Return the authenticated user object
 */
export async function loginService(data: LoginRequest): Promise<AuthUser> {
  const response = await loginApi(data)
  setToken(response.accessToken, response.refreshToken)
  return response.user
}

/**
 * Register service:
 * 1. Call the register API
 * 2. Return the server response (message / user)
 */
export async function registerService(data: RegisterRequest): Promise<RegisterResponse> {
  return registerApi(data)
}

/**
 * Logout service:
 * 1. Remove all tokens from storage
 * (The AuthContext is responsible for clearing state.)
 */
export function logoutService(): void {
  removeToken()
}
