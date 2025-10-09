import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import mongoose from "mongoose";

import newsRoutes from "./routes/news.js";
import predictionsRoutes from "./routes/predictions.js";
import { matchRoutes } from "./routes/matches.js";
import coppaRoutes from "./routes/coppa.js";
import errorsRoutes from "./routes/errors.js";
import { healthRoutes } from "./routes/health.js";

const fastify = Fastify({ 
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
});

// Register security plugins
// CORS - Allow only specific frontend origin
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://0.0.0.0:5000'];

// In production, also allow the Replit domain if set
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}

await fastify.register(cors, { 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) for development only
    if (!origin && process.env.NODE_ENV !== 'production') {
      callback(null, true);
      return;
    }
    
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

await fastify.register(helmet, {
  contentSecurityPolicy: false
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// No global Content-Type hook needed - let routes set their own MIME types

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sportscentral";
const REQUIRE_DB = process.env.REQUIRE_DB === 'true' || process.env.NODE_ENV === 'production';

mongoose
  .connect(MONGODB_URI)
  .then(() => fastify.log.info("✅ MongoDB connected successfully"))
  .catch((err) => {
    fastify.log.error("❌ MongoDB connection failed:", err.message);
    
    if (REQUIRE_DB) {
      fastify.log.error("Database required in production. Exiting...");
      process.exit(1);
    } else {
      fastify.log.warn("⚠️  Running without database (development only)");
    }
  });

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  reply.status(error.statusCode || 500).send({
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    statusCode: error.statusCode || 500
  });
});

// Register routes
fastify.register(healthRoutes, { prefix: "/health" });
fastify.register(newsRoutes, { prefix: "/news" });
fastify.register(predictionsRoutes, { prefix: "/predictions" });
fastify.register(matchRoutes, { prefix: "/matches" });
fastify.register(coppaRoutes, { prefix: "/coppa" });
fastify.register(errorsRoutes, { prefix: "/errors" });

// Start server
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

fastify.listen({ port: PORT, host: HOST }).then((address) => {
  fastify.log.info(`✅ Backend running at ${address}`);
}).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
