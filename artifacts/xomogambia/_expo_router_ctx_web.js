// Custom replacement for expo-router/_ctx.web.js
// This file lives at artifacts/xomogambia/, so "./app" resolves correctly
// to artifacts/xomogambia/app/ regardless of absolute/relative path issues.
export const ctx = require.context(
  "./app",
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+middleware)|(?:\+(html|native-intent))))\.[tj]sx?$).*(?:\.android|\.ios|\.native)?\.[tj]sx?$/,
  "lazy"
);
