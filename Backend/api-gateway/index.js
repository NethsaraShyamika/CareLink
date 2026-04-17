import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Define routes and their target microservices
const routes = {
  "/api/patients": "http://localhost:3001",
  "/api/doctors": "http://localhost:3002",
  "/api/appointments": "http://localhost:5002",
  "/api/telemedicines": "http://localhost:3004",
  "/api/payments": "http://localhost:3005",
  "/api/notifications": "http://localhost:3006",
  "/api/symptoms": "http://localhost:3007",
  "/api/auth": "http://localhost:3008",
};

// Set up proxy middleware for each route
for (const route in routes) {
  const target = routes[route];

  app.use(
    route,
    createProxyMiddleware({
      target,
      changeOrigin: true,

      pathRewrite: (path, req) => req.originalUrl,

      // 🔥 ADD THIS
      onProxyReq: (proxyReq, req) => {
        if (req.headers.authorization) {
          proxyReq.setHeader("authorization", req.headers.authorization);
        }
      },
    }),
  );
}

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "api-gateway",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log("Proxying the following services:");

  Object.entries(routes).forEach(([route, target]) => {
    console.log(`  ${route} -> ${target}`);
  });
});
