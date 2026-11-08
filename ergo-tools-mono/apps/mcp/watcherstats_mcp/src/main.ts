import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { CreatePermitsDownloadService, CreateWatcherDownloadService, PermitsDataService, permitTriggerAddresses, UrlAction } from '@ergo-tools/service';

import {
  McpServer,
  createMcpHandler
} from '@modelcontextprotocol/server';

import * as z from 'zod/v4';

//const downloadService = CreateWatcherDownloadService();


const handler = createMcpHandler(() => {
  const server = new McpServer({
    name: 'my-nx-mcp',
    version: '1.0.0'
  });

  server.registerTool(
    'get_customer',
    {
      description: 'Get a customer by ID',
      inputSchema: z.object({
        id: z.string()
      })
    },
    async ({ id }) => {
      const customer = { id };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(customer)
          }
        ],
        structuredContent: customer
      };
    }
  );

  return server;
});

createServer(async (req, res) => {
  if (req.url?.split('?')[0] !== '/mcp') {
    res.writeHead(404).end();
    return;
  }

  try {
    const url = new URL(req.url, 'http://localhost:3001');

    const request = new Request(url, {
      method: req.method,
      headers: new Headers(
        req.headers as Record<string, string>
      ),
      body: req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : Readable.toWeb(req) as ReadableStream,
      duplex: 'half'
    } as RequestInit);

    const response = await handler.fetch(request);

    res.writeHead(
      response.status,
      Object.fromEntries(response.headers)
    );

    if (response.body) {
      Readable.fromWeb(
        response.body as any
      ).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500).end();
  }
}).listen(3001);