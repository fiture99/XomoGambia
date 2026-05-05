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

config.resolver.extraNodeModules = {
  "react": path.resolve(projectRoot, "node_modules/react"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
};

// Intercept "expo-router/_ctx" imports and redirect to our custom _ctx.web.js
// that uses a local relative path ("./app") instead of process.env.EXPO_ROUTER_APP_ROOT.
// The env var gets inlined as an absolute path by babel-plugin-transform-inline-environment-variables,
// and Metro's require.context treats it as relative to _ctx.web.js inside node_modules,
// producing a bogus path that has no files (empty context, no routes discovered).
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "expo-router/_ctx" && platform === "web") {
    return {
      type: "sourceFile",
      filePath: path.join(projectRoot, "_expo_router_ctx_web.js"),
    };
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
