"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const node_stream_1 = require("node:stream");
const service_1 = require("@ergo-tools/service");
const file_storage_service_js_1 = require("./file.storage.service.js");
const get_watchers_stats_tool_js_1 = require("./get-watchers-stats.tool.js");
const server_1 = require("@modelcontextprotocol/server");
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
const processEventService = (0, service_1.CreateProcessEventService)(new DirectEventSender(eventService), new file_storage_service_js_1.FileStorageService());
var getWatchersStatsTool = new get_watchers_stats_tool_js_1.GetWatchersStatsTool(eventService);
const handler = (0, server_1.createMcpHandler)(() => {
    const server = new server_1.McpServer({
        name: 'my-nx-mcp',
        version: '1.0.0'
    });
    getWatchersStatsTool.register(server);
    return server;
});
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