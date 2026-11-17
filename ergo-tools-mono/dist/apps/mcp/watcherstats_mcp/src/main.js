"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const node_stream_1 = require("node:stream");
const service_1 = require("@ergo-tools/service");
const server_1 = require("@modelcontextprotocol/server");
const z = __importStar(require("zod/v4"));
class DirectEventSender {
    eventService;
    constructor(eventService) {
        this.eventService = eventService;
    }
    async sendEvent(event) {
        this.eventService.sendEventWithData(event.type, event.data ?? '');
    }
}
var eventService = new service_1.EventService();
const processEventService = (0, service_1.CreateProcessEventService)(new DirectEventSender(eventService), service_1.StorageType.Memory);
var watchersStats = null;
eventService.subscribeToEvent(service_1.EventType.WatchersStatsChanged, (data) => {
    watchersStats = data;
});
for (const c of (0, service_1.getActiveChainTypes)()) {
    processEventService.processEvent({
        data: c,
        type: service_1.EventType.ReportsRequested,
    });
}
processEventService.processEvent({
    data: null,
    type: service_1.EventType.WatcherStatsRequested,
});
processEventService.processEvent({
    data: null,
    type: service_1.EventType.PerformanceScreenLoaded,
});
const handler = (0, server_1.createMcpHandler)(() => {
    const server = new server_1.McpServer({
        name: 'my-nx-mcp',
        version: '1.0.0'
    });
    server.registerTool('get_customer', {
        description: 'Get a customer by ID',
        inputSchema: z.object({
            id: z.string()
        })
    }, async ({ id }) => {
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
    });
    return server;
});
(0, node_http_1.createServer)(async (req, res) => {
    if (req.url?.split('?')[0] !== '/mcp') {
        res.writeHead(404).end();
        return;
    }
    try {
        const url = new URL(req.url, 'http://localhost:3001');
        const request = new Request(url, {
            method: req.method,
            headers: new Headers(req.headers),
            body: req.method === 'GET' || req.method === 'HEAD'
                ? undefined
                : node_stream_1.Readable.toWeb(req),
            duplex: 'half'
        });
        const response = await handler.fetch(request);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        if (response.body) {
            node_stream_1.Readable.fromWeb(response.body).pipe(res);
        }
        else {
            res.end();
        }
    }
    catch (error) {
        console.error(error);
        res.writeHead(500).end();
    }
}).listen(3001);
//# sourceMappingURL=main.js.map