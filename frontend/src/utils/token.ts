const ACCESS_TOKEN_KEY = 'pulse_access_token'
const REFRESH_TOKEN_KEY = 'pulse_refresh_token'

/**
 * Persist tokens to localStorage.
 * refreshToken is optional — not all flows return it.
 */
export function setToken(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

/** Retrieve the stored access token, or null if not found. */
export function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/** Retrieve the stored refresh token, or null if not found. */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/** Remove both tokens from storage (called on logout or 401). */
export function removeToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/** Returns true when an access token is present in storage. */
export function isTokenValid(): boolean {
  const token = getToken()
  return !!token
}
