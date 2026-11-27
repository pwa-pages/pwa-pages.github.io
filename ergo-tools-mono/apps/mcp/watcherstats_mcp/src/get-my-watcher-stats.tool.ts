import {
  EventService,
  EventType,
  PermitInfo,
  ProcessEventService,
} from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loadToolDescription } from './tool-description.js';

export class GetMyWatcherStatsTool {
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private eventService: EventService,
    private processEventService: ProcessEventService,
    private readonly timeoutMs = 60_000,
  ) {}

  register(server: McpServer): void {
    server.registerTool(
      'get_my_watcher_stats',
      {
        description: loadToolDescription('get-my-watcher-stats.md'),
        inputSchema: z.object({
          address: z.string().trim().min(1)
            .describe('Watcher address to retrieve permits for'),
        }),
      },
      async ({ address }) => {
        let expired = false;
        const operation = this.queue.then(async () => {
          if (expired) return null;

          let permits: PermitInfo[] | undefined;
          const subscription = this.eventService
            .observeEvent<PermitInfo[]>(EventType.PermitsChanged)
            .subscribe((data) => { permits = data; });

          try {
            await this.processEventService.processEvent({
              type: EventType.MyWatcherStatsRequested,
              data: { addresses: [address] },
            }, { throwOnError: true });

            if (!Array.isArray(permits)) {
              throw new Error('No valid permit snapshot was received.');
            }
            const selected = permits
              .filter((permit) => permit.address === address)
              .map(({ address, chainType, permitCount, activePermitCount }) => ({
                address,
                chainType,
                permitCount,
                activePermitCount,
              }));
            const serialized = JSON.stringify(selected);
            return {
              content: [{ type: 'text' as const, text: serialized }],
              structuredContent: { permits: selected },
            };
          } finally {
            subscription.unsubscribe();
          }
        });

        // Keep later requests queued even if this caller times out.
        this.queue = operation.then(() => undefined, () => undefined);
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          const result = await Promise.race([
            operation,
            new Promise<null>((resolve) => {
              timer = setTimeout(() => {
                expired = true;
                resolve(null);
              }, this.timeoutMs);
            }),
          ]);
          if (result === null) {
            return {
              content: [{ type: 'text' as const, text: 'Watcher permits were not available before the request timed out.' }],
              isError: true,
            };
          }
          return result;
        } catch (error) {
          console.error('[GetMyWatcherStatsTool] Error:', error);
          const message = error instanceof Error ? error.message : String(error);
          return {
            content: [{ type: 'text' as const, text: `Failed to retrieve watcher permits: ${message}` }],
            isError: true,
          };
        } finally {
          if (timer !== undefined) clearTimeout(timer);
        }
      },
    );
  }
}
