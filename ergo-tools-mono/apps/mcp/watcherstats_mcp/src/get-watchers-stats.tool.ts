
import {
  EventService,
  EventType,
  ProcessEventService,
  WatchersStats,
  watcherStatsEventIdentifier
} from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loadToolDescription } from './tool-description.js';

export class GetWatchersStatsTool {
  private watchersStats: WatchersStats | null = null;
  private ready = false;

  constructor(
    private eventService: EventService,
    private processEventService: ProcessEventService
  ) {
    this.eventService.subscribeToEvent(
      EventType.WatchersStatsChanged,
      (data: WatchersStats) => {
        this.watchersStats = data;
      }
    );

    this.eventService.subscribeToEvent(
      EventType.EndFullDownload,
      async (data: string) => {
        if (data === watcherStatsEventIdentifier) {
          this.ready = true;
        }
      }
    );
  }

  register(server: McpServer): void {
    server.registerTool(
      'get_watchers_stats',
      {
        description: loadToolDescription(
          'get-watchers-stats.md'
        ),
        inputSchema: z.object({
        })
      },
      async () => {

        this.ready = false;

        setImmediate(() => {
          void this.processEventService
            .processEvent({
              data: null,
              type: EventType.WatcherStatsRequested
            })
            .catch((error) => {
              console.error(
                '[GetWatchersStatsTool] Background event failed:',
                error
              );
            });
        });

        const deadline = Date.now() + 10_000;
        while (!this.ready && Date.now() < deadline) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (!this.ready) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'Watcher stats were not available after 10 seconds.'
              }
            ],
            isError: true
          };
        }


        const watchersStats = this.watchersStats;

        if (watchersStats === null) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'Watcher statistics are not available yet.'
              }
            ],
            isError: true
          };
        }

        try {
          // Serialize to JSON.
          const serialized = JSON.stringify(watchersStats);

          if (serialized === undefined) {
            throw new Error(
              'WatchersStats cannot be serialized to JSON'
            );
          }

          // Convert into a plain JavaScript value.
          const parsed: unknown = JSON.parse(serialized);

          // MCP structuredContent must be a JSON object.
          if (
            parsed === null ||
            typeof parsed !== 'object' ||
            Array.isArray(parsed)
          ) {
            throw new Error(
              'WatchersStats must serialize to a JSON object. ' +
              `Received: ${serialized}`
            );
          }

          const structuredStats =
            parsed as Record<string, unknown>;

          console.log(
            '[GetWatchersStatsTool] Returning stats:',
            structuredStats
          );

          return {
            content: [
              {
                type: 'text' as const,
                text: serialized
              }
            ],
            structuredContent: structuredStats
          };

        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : String(error);

          console.error(
            '[GetWatchersStatsTool] Error:',
            error
          );

          return {
            content: [
              {
                type: 'text' as const,
                text: `Failed to retrieve watcher statistics: ${message}`
              }
            ],
            isError: true
          };
        }
      }
    );
  }
}
