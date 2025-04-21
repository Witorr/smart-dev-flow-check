export function saveGoogleAccessToken(token: string) {
  // Só salva se for um token do Google (ya29...)
  if (token && token.startsWith('ya29.')) {
    localStorage.setItem('google_access_token', token);
  }
}

export function getGoogleAccessToken() {
  return localStorage.getItem('google_access_token') || '';
}
