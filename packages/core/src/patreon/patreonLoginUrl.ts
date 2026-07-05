import { secret } from "../secrets";

export function patreonLoginUrl() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: secret("PUBLIC_PATREON_CLIENT_ID"),
    redirect_uri: secret("PUBLIC_PATREON_REDIRECT_URI"),
    scope: "identity",
  });

  return `https://www.patreon.com/oauth2/authorize?${params}`;
}
