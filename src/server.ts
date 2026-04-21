import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const backendOrigin = process.env['BACKEND_URL'] ?? 'http://localhost:3000';

const app = express();
const angularApp = new AngularNodeAppEngine();

async function readRequestBody(req: express.Request): Promise<Buffer | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

/**
 * Forward API calls to the NestJS backend so SSR and local Node serving keep the
 * same /api contract as Docker/Nginx.
 */
app.use('/api/{*splat}', async (req, res, next) => {
  try {
    const targetUrl = `${backendOrigin}${req.originalUrl.replace(/^\/api/, '')}`;
    const requestHeaders = new Headers();
    const requestBody = await readRequestBody(req);

    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        for (const entry of value) {
          requestHeaders.append(key, entry);
        }
        continue;
      }

      if (typeof value === 'string') {
        requestHeaders.set(key, value);
      }
    }

    requestHeaders.set('host', new URL(backendOrigin).host);

    const backendResponse = await fetch(targetUrl, {
      method: req.method,
      headers: requestHeaders,
      body: requestBody ? new Uint8Array(requestBody) : undefined,
    });

    res.status(backendResponse.status);

    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') {
        return;
      }

      res.setHeader(key, value);
    });

    const responseBuffer = Buffer.from(await backendResponse.arrayBuffer());
    res.send(responseBuffer);
  } catch (error) {
    next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
