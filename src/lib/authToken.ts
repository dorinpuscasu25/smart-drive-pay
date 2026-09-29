
const TOKEN_KEY = 'smart_driver_pay_auth_token';

export async function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}
