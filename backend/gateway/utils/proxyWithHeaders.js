import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

export const proxyWithUser = (serviceUrl, pathPrefix) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: pathPrefix ? { [`^${pathPrefix}`]: "" } : undefined,
    on: {
      proxyReq: (proxyReq, req, res) => {
        if (req.user) {
          proxyReq.setHeader("x-user-id", req.user.userId || "");
          proxyReq.setHeader("x-user-email", req.user.email || "");
          proxyReq.setHeader("x-user-avatar", req.user.avatar || "");
        }
        const contentType = req.headers["content-type"] || "";
        if (!contentType.includes("multipart/form-data")) {
          fixRequestBody(proxyReq, req);
        }
      }
    }
  });
};

export const createServiceProxy = (serviceUrl, pathPrefix) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: pathPrefix ? { [`^${pathPrefix}`]: "" } : undefined,
    on: {
      proxyReq: (proxyReq, req, res) => {
        const contentType = req.headers["content-type"] || "";
        if (!contentType.includes("multipart/form-data")) {
          fixRequestBody(proxyReq, req);
        }
      }
    }
  });
};
