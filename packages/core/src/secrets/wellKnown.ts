export type WellKnownSecret =
  // development set-up
  | "TEMP"
  // website
  | "BUILD_CHUNK"
  | "TEXTURE_CHUNKS"
  // wotb
  | "WOTB_SERVER"
  | "WOTB_VERSION"
  | "PUBLIC_WOTB_CLIENT"
  | "WOTB_USMAP"
  // google
  | "GOOGLE_APPLICATION_CREDENTIALS"
  | "PUBLIC_GOOGLE_ANALYTICS_PROPERTY_ID"
  // patreon
  | "PUBLIC_PATREON_CLIENT_ID"
  | "PUBLIC_PATREON_REDIRECT_URI";
