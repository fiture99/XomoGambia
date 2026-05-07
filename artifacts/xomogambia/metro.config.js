const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

process.env.EXPO_ROUTER_APP_ROOT = "app";

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const projectRelativePath = path.relative(workspaceRoot, projectRoot).replace(/\\/g, '/');

const config = getDefaultConfig(projectRoot);

// Tell Metro the project root is here, not the workspace root
config.projectRoot = projectRoot;

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

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
  } catch (_) {}
}

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fix expo-router route discovery for all platforms
  if (moduleName === "expo-router/_ctx") {
    return {
      type: "sourceFile",
      filePath: path.join(projectRoot, "_expo_router_ctx_web.js"),
    };
  }

  // Fix doubled path for native lazy route bundles
  // Metro resolves ./artifacts/xomogambia/app/X but context gives artifacts\xomogambia\app\X
  const doubled = `./artifacts/xomogambia/artifacts`;
  if (moduleName.startsWith(doubled)) {
    const fixed = moduleName.replace(doubled, `./artifacts`);
    return context.resolveRequest(context, fixed, platform);
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

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => {
    return (req, res, next) => {
      const url = (req.url || "").replace(/\\/g, '/');
      req.url = url;
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