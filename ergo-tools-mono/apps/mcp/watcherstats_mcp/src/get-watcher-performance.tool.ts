import {
  EventService,
  EventType,
  permitTriggerAddresses,
  ProcessEventService,
  WatchersPerformanceStats,
} from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loadToolDescription } from './tool-description.js';

type ActiveRequest = {
  address: string;
  latestStats: WatchersPerformanceStats | null;
  resolve: (stats: WatchersPerformanceStats) => void;
};

function isPerformanceStats(data: unknown): data is WatchersPerformanceStats {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const performances = Reflect.get(data, 'watcherPerformances');
  return performances !== null &&
    typeof performances === 'object' &&
    !Array.isArray(performances);
}

export class GetWatcherPerformanceTool {
  private readonly activeRequests = new Set<ActiveRequest>();

  constructor(
    private eventService: EventService,
    private processEventService: ProcessEventService,
    private readonly timeoutMs = 60_000,
  ) {
    this.eventService.subscribeToEvent<WatchersPerformanceStats>(
      EventType.ReportsChanged,
      (data) => {
        if (!isPerformanceStats(data)) return;

        for (const request of this.activeRequests) {
          request.latestStats = data;
        }
      },
    );

    this.eventService.subscribeToEvent<string>(
      EventType.ALLReportsDataAvailable,
      (address) => {
        for (const request of this.activeRequests) {
          if (request.address !== address || request.latestStats === null) {
            continue;
          }

          this.activeRequests.delete(request);
          request.resolve(request.latestStats);
        }
      },
    );
  }

  register(server: McpServer): void {
    server.registerTool(
      'get_watcher_performance',
      {
        description: loadToolDescription('get-watcher-performance.md'),
        inputSchema: z.object({
          chainType: z.string().trim().min(1)
            .describe('Chain type to retrieve report statistics for'),
        }),
      },
      async ({ chainType }) => {
        const address = Object.entries(permitTriggerAddresses)
          .find(([supportedChain]) => supportedChain === chainType)?.[1];

        if (!address) {
          return {
            content: [{
              type: 'text' as const,
              text: `Reports are not available for chain type "${chainType}".`,
            }],
            isError: true,
          };
        }

        let request: ActiveRequest | undefined;
        let timer: ReturnType<typeof setTimeout> | undefined;

        try {
          const stats = await Promise.race([
            new Promise<WatchersPerformanceStats>((resolve, reject) => {
              request = {
                address,
                latestStats: null,
                resolve,
              };
              this.activeRequests.add(request);

              setImmediate(() => {
                void this.processEventService.processEvent({
                  type: EventType.ReportsRequested,
                  data: chainType as unknown as object,
                }, { throwOnError: true }).catch(reject);
              });
            }),
            new Promise<never>((_, reject) => {
              timer = setTimeout(() => {
                reject(new Error(
                  'Watcher report statistics were not available before the request timed out.',
                ));
              }, this.timeoutMs);
            }),
          ]);

          const watcherPerformances =
            stats.watcherPerformances?.[chainType] ?? {};

          const result = {
            watcherPerformances: {
              [chainType]: watcherPerformances,
            },
          };
          const serialized = JSON.stringify(result);

          return {
            content: [{ type: 'text' as const, text: serialized }],
            structuredContent: result,
          };
        } catch (error) {
          console.error('[GetWatcherPerformanceTool] Error:', error);
          const message = error instanceof Error ? error.message : String(error);

          return {
            content: [{
              type: 'text' as const,
              text: `Failed to retrieve watcher report statistics: ${message}`,
            }],
            isError: true,
          };
        } finally {
          if (request) {
            this.activeRequests.delete(request);
          }
          if (timer !== undefined) {
            clearTimeout(timer);
          }
        }
      },
    );
  }
}
