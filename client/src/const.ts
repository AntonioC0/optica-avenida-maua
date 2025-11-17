export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Ótica Avenida Mauá";

// Logo com cores da Ótica Avenida Mauá (Amarelo e Preto)
export const APP_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23FCD34D'/%3E%3Ctext x='64' y='70' font-size='48' font-weight='bold' fill='%23000' text-anchor='middle' font-family='Arial'%3EÓ%3C/text%3E%3Ccircle cx='40' cy='50' r='12' fill='%23000' opacity='0.8'/%3E%3Ccircle cx='88' cy='50' r='12' fill='%23000' opacity='0.8'/%3E%3C/svg%3E";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
