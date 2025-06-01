import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { users } from "../shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// КРИТИЧЕСКИ ВАЖНО: healthcheck endpoints должны быть ПЕРВЫМИ
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000
  });
});

app.get('/', (req, res) => {
  console.log('Root endpoint requested');
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('🚀 Starting server initialization...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'production');
    console.log('🔌 Port:', process.env.PORT || 5000);
    console.log('🌐 Host: 0.0.0.0');
    
    // Регистрируем API routes
    console.log('📋 Registering routes...');
    const server = await registerRoutes(app);
    console.log('✅ Routes registered successfully');

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('❌ Error middleware triggered:', { status, message });
      res.status(status).json({ message });
    });

    // Setup Vite or static serving
    if (app.get("env") === "development") {
      console.log('🔧 Setting up Vite for development...');
      await setupVite(app, server);
    } else {
      console.log('📦 Setting up static serving for production...');
      serveStatic(app);
    }

    // Start server - КРИТИЧЕСКИ ВАЖНО: используем 0.0.0.0
    const PORT = process.env.PORT || 5000;
    const HOST = '0.0.0.0'; // Railway требует 0.0.0.0
    
    const serverInstance = app.listen(PORT, HOST, () => {
      console.log(`✅ Server running on ${HOST}:${PORT}`);
      console.log(`🏥 Health check available at http://${HOST}:${PORT}/health`);
      console.log('🎉 Server startup complete!');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('⚠️ SIGTERM received, shutting down gracefully');
      serverInstance.close(() => {
        console.log('💀 Process terminated');
      });
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
})();