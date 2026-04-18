import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

app.use(
  cors({
    
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:3000",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  }),
);


const routes = {
  "/api/patients": process.env.PATIENT_SERVICE_URL || "http://localhost:3001",
  "/api/doctors": process.env.DOCTOR_SERVICE_URL || "http://localhost:3002",
  "/api/appointments": process.env.APPOINTMENT_SERVICE_URL || "http://localhost:3003",
  "/api/telemedicine": process.env.TELEMEDICINE_SERVICE_URL || "http://localhost:3004",
  "/api/payments": process.env.PAYMENT_SERVICE_URL || "http://localhost:3005",
  "/api/notifications": process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006",
  "/api/symptoms": process.env.SYMPTOM_SERVICE_URL || "http://localhost:3007",
  "/api/auth": process.env.AUTH_SERVICE_URL || "http://localhost:3008",
};


for (const route in routes) {
  const target = routes[route];

  app.use(
    route,
    createProxyMiddleware({
      target,
      changeOrigin: true,

      pathRewrite: (path, req) => req.originalUrl,

      
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
