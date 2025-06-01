import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const viteLogger = createLogger();

// Определяем __dirname для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Используем __dirname вместо import.meta.dirname
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  
  console.log(`📁 Looking for static files in: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️ Build directory not found: ${distPath}`);
    console.log(`📂 Creating fallback static serving...`);
    
    // Fallback: попробуем найти client/dist или просто dist
    const fallbackPaths = [
      path.resolve(__dirname, "..", "client", "dist"),
      path.resolve(__dirname, "..", "dist"),
      path.resolve(process.cwd(), "dist", "public"),
      path.resolve(process.cwd(), "client", "dist")
    ];
    
    let foundPath = null;
    for (const fallbackPath of fallbackPaths) {
      if (fs.existsSync(fallbackPath)) {
        foundPath = fallbackPath;
        console.log(`✅ Found static files at: ${foundPath}`);
        break;
      }
    }
    
    if (!foundPath) {
      console.error(`❌ Could not find any build directory. Checked paths:`);
      console.error(`   - ${distPath}`);
      fallbackPaths.forEach(p => console.error(`   - ${p}`));
      
      // Создаем простой fallback
      app.use("*", (_req, res) => {
        res.status(200).json({ 
          message: "Static files not found, but server is running",
          timestamp: new Date().toISOString()
        });
      });
      return;
    }
    
    app.use(express.static(foundPath));
    app.use("*", (_req, res) => {
      const indexPath = path.resolve(foundPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).json({ 
          message: "App is running",
          timestamp: new Date().toISOString()
        });
      }
    });
    return;
  }

  console.log(`✅ Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).json({ 
        message: "App is running",
        timestamp: new Date().toISOString()
      });
    }
  });
}
