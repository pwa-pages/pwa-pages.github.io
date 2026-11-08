var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// apps/mcp/watcherstats_mcp/src/main.ts
var import_node_http = require("node:http");
var import_node_stream = require("node:stream");
var import_server = require("@modelcontextprotocol/server");
var z = __toESM(require("zod/v4"));
var handler = (0, import_server.createMcpHandler)(() => {
  const server = new import_server.McpServer({
    name: "my-nx-mcp",
    version: "1.0.0"
  });
  server.registerTool(
    "get_customer",
    {
      description: "Get a customer by ID",
      inputSchema: z.object({
        id: z.string()
      })
    },
    async ({ id }) => {
      const customer = { id };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(customer)
          }
        ],
        structuredContent: customer
      };
    }
  );
  return server;
});
(0, import_node_http.createServer)(async (req, res) => {
  if (req.url?.split("?")[0] !== "/mcp") {
    res.writeHead(404).end();
    return;
  }
  try {
    const url = new URL(req.url, "http://localhost:3001");
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(
        req.headers
      ),
      body: req.method === "GET" || req.method === "HEAD" ? void 0 : import_node_stream.Readable.toWeb(req),
      duplex: "half"
    });
    const response = await handler.fetch(request);
    res.writeHead(
      response.status,
      Object.fromEntries(response.headers)
    );
    if (response.body) {
      import_node_stream.Readable.fromWeb(
        response.body
      ).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500).end();
  }
}).listen(3001);
