import axiosInstance from '@/api/axios'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types/auth'

/**
 * POST /auth/login
 * Returns the full server response including tokens and user.
 */
export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/api/auth/login', payload)
  return data
}
/**
 * POST /auth/register
 * Returns a success message and optionally the created user.
 */

export async function registerApi(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await axiosInstance.post<RegisterResponse>('/api/auth/register', payload)
  return data
}

