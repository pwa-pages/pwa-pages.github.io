
import { createServer } from 'node:http';
import { Readable } from 'node:stream';

import {
  CreateProcessEventService,
  EventPayload,
  EventSender,
  EventService,
  EventType,
  getActiveChainTypes
} from '@ergo-tools/service';

import {
  McpServer,
  createMcpHandler
} from '@modelcontextprotocol/server';

// Use the stdio transport import supported by your SDK version
import { StdioServerTransport } from
  '@modelcontextprotocol/sdk/server/stdio.js';

import { FileStorageService } from './file.storage.service.js';
import { GetWatchersStatsTool } from './get-watchers-stats.tool.js';

// Redirect console logs to stderr in stdio mode
function redirectLogsToStderr(): void {
  console.log = (...args: unknown[]) => {
    console.error(...args);
  };

  console.info = (...args: unknown[]) => {
    console.error(...args);
  };

  console.debug = (...args: unknown[]) => {
    console.error(...args);
  };
}

class DirectEventSender implements EventSender {
  constructor(private eventService: EventService) { }

  async sendEvent<T>(event: EventPayload<T>): Promise<void> {
    this.eventService.sendEventWithData(
      event.type as EventType,
      event.data ?? ''
    );
  }
}

// Redirect logs before initializing shared services
if (process.env.MCP_TRANSPORT === 'stdio') {
  redirectLogsToStderr();
}

// Shared services
const eventService = new EventService();

const processEventService = CreateProcessEventService(
  new DirectEventSender(eventService),
  new FileStorageService()
);

const getWatchersStatsTool =
  new GetWatchersStatsTool(eventService);

// Shared MCP server factory
function createRosenMcpServer(): McpServer {
  const server = new McpServer({
    name: 'rosen-mcp',
    version: '1.0.0'
  });

  getWatchersStatsTool.register(server);

  return server;
}


async function initializeServices(): Promise<void> {




  for (const c of getActiveChainTypes()) {
    processEventService.processEvent({
      data: c as unknown as object,
      type: EventType.ReportsRequested
    });
  }

  processEventService.processEvent({
    data: null,
    type: EventType.PerformanceScreenLoaded
  });

  processEventService.processEvent({
    data: null,
    type: EventType.WatcherStatsRequested
  });


}

// STDIO
async function startStdio(): Promise<void> {
  const server = createRosenMcpServer();

  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Important: never log to stdout in stdio mode
  console.error('Rosen MCP running on stdio');
}

// HTTP
function startHttp(): void {
  const handler = createMcpHandler(
    () => createRosenMcpServer()
  );

  createServer(async (req, res) => {
    if (req.url?.split('?')[0] !== '/mcp') {
      res.writeHead(404).end();
      return;
    }

    try {
      const url = new URL(
        req.url,
        'http://localhost:3001'
      );

      const request = new Request(url, {
        method: req.method,
        headers: new Headers(
          req.headers as Record<string, string>
        ),
        body:
          req.method === 'GET' ||
            req.method === 'HEAD'
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

  console.error('Rosen MCP HTTP listening on port 3001');
}

// Entry point
async function main(): Promise<void> {
  const mode = process.env.MCP_TRANSPORT === 'stdio'
    ? 'stdio'
    : 'http';

  // Redirect logs in stdio mode
  if (mode === 'stdio') {
    redirectLogsToStderr();
  }

  // Start the transport before requesting data.
  if (mode === 'stdio') {
    await startStdio();
  } else {
    startHttp();
  }

  await initializeServices();
}

main().catch((error) => {
  console.error('Failed to start Rosen MCP:', error);
  process.exitCode = 1;
});
