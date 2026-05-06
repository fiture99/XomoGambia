const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

process.env.EXPO_ROUTER_APP_ROOT = "app";

const config = getDefaultConfig(__dirname);

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

// Path of this project relative to the workspace root (e.g. "artifacts/xomogambia")
const projectRelativePath = path.relative(workspaceRoot, projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Packages that must resolve to a single copy to avoid "Invalid hook call" errors.
// In a pnpm monorepo different packages can reach the same npm package through
// different symlink chains; Metro sees them as separate module instances.
// We pin them all to the project-local resolution so there is exactly one copy.
const SINGLETON_PACKAGES = [
  "react",
  "react-dom",
  "react-native",
  "react-native-web",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

const singletonMap = {};
for (const pkg of SINGLETON_PACKAGES) {
  try {
    singletonMap[pkg] = require.resolve(
      path.join(projectRoot, "node_modules", pkg)
    );
  } catch (_) {
    // package not installed locally — leave Metro to resolve normally
  }
}

// Intercept "expo-router/_ctx" imports and redirect to our custom _ctx.web.js
// that uses a local relative path ("./app") instead of process.env.EXPO_ROUTER_APP_ROOT.
// The env var gets inlined as an absolute path by babel-plugin-transform-inline-environment-variables,
// and Metro's require.context treats it as relative to _ctx.web.js inside node_modules,
// producing a bogus path that has no files (empty context, no routes discovered).
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fix expo-router route discovery on web
  if (moduleName === "expo-router/_ctx" && platform === "web") {
    return {
      type: "sourceFile",
      filePath: path.join(projectRoot, "_expo_router_ctx_web.js"),
    };
  }

  // Pin singleton packages to a single copy
  if (singletonMap[moduleName]) {
    return { type: "sourceFile", filePath: singletonMap[moduleName] };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Metro resolves lazy bundle URL paths relative to the workspace root, but
// the browser requests them relative to the artifact root (e.g. /app/_layout.bundle).
// This middleware rewrites those requests to the full workspace-relative path
// (e.g. /artifacts/xomogambia/app/_layout.bundle) so Metro can find them.
config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => {
    return (req, res, next) => {
      const url = req.url || "";
      const isBundleRequest = url.includes(".bundle");
      const isAlreadyRooted =
        url.startsWith("/node_modules/") ||
        url.startsWith(`/${projectRelativePath}/`) ||
        url.startsWith("/home/") ||
        url.startsWith("/assets/") ||
        url.startsWith("/__") ||
        url.startsWith("/debugger") ||
        url.startsWith("/status");

      if (isBundleRequest && !isAlreadyRooted) {
        req.url = `/${projectRelativePath}${url}`;
      }
      return metroMiddleware(req, res, next);
    };
  },
};

module.exports = config;
