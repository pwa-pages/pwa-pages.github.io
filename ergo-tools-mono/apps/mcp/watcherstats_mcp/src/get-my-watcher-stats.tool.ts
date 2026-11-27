import {
  EventService,
  EventType,
  PermitInfo,
  ProcessEventService,
} from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loadToolDescription } from './tool-description.js';

type ActiveRequest = {
  requestedSet: Set<string>;
  resolve: (permits: PermitInfo[]) => void;
};

export class GetMyWatcherStatsTool {
  private readonly activeRequests = new Set<ActiveRequest>();

  constructor(
    private eventService: EventService,
    private processEventService: ProcessEventService,
    private readonly timeoutMs = 60_000,
  ) {
    this.eventService.subscribeToEvent<PermitInfo[]>(
      EventType.PermitsChanged,
      (data) => {
        if (!Array.isArray(data)) return;

        for (const request of this.activeRequests) {
          const permits = data.filter((permit) =>
            request.requestedSet.has(permit.address),
          );

          if (permits.length > 0) {
            this.activeRequests.delete(request);
            request.resolve(permits);
          }
        }
      },
    );
  }

  register(server: McpServer): void {
    server.registerTool(
      'get_my_watcher_stats',
      {
        description: loadToolDescription('get-my-watcher-stats.md'),
        inputSchema: z.object({
          addresses: z.array(z.string().trim().min(1)).min(1)
            .describe('Watcher addresses to retrieve permits for'),
        }),
      },
      async ({ addresses }) => {
        const requestedAddresses = addresses;

        let request: ActiveRequest | undefined;
        let timer: ReturnType<typeof setTimeout> | undefined;

        try {
          const operation = new Promise<PermitInfo[]>(
            (resolve, reject) => {
              request = {
                requestedSet: new Set(requestedAddresses),
                resolve,
              };

              this.activeRequests.add(request);

              setImmediate(() => {
                void this.processEventService.processEvent({
                  type: EventType.MyWatcherStatsRequested,
                  data: { addresses: requestedAddresses },
                }, { throwOnError: true }).catch(reject);
              });
            },
          );

          const permits = await Promise.race([
            operation,
            new Promise<never>((_, reject) => {
              timer = setTimeout(() => {
                reject(new Error(
                  'Watcher permits were not available before the request timed out.',
                ));
              }, this.timeoutMs);
            }),
          ]);

          const selected = permits.map(
            ({ address, chainType, permitCount, activePermitCount }) => ({
              address,
              chainType,
              permitCount,
              activePermitCount,
            }),
          );

          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(selected),
            }],
            structuredContent: { permits: selected },
          };
        } catch (error) {
          console.error('[GetMyWatcherStatsTool] Error:', error);

          const message = error instanceof Error
            ? error.message
            : String(error);

          return {
            content: [{
              type: 'text' as const,
              text: `Failed to retrieve watcher permits: ${message}`,
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