
import {
  EventService,
  EventType,
  WatchersStats
} from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loadToolDescription } from './tool-description.js';

export class GetWatchersStatsTool {
  private watchersStats: WatchersStats | null = null;

  constructor(
    private eventService: EventService
  ) {
    this.eventService.subscribeToEvent(
      EventType.WatchersStatsChanged,
      (data: WatchersStats) => {
        console.log('[WatchersStats] Event received');
        console.log('[WatchersStats] Type:', typeof data);
        console.log(
          '[WatchersStats] Constructor:',
          data?.constructor?.name
        );
        console.log(
          '[WatchersStats] JSON:',
          JSON.stringify(data)
        );

        this.watchersStats = data;
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
          address: z.string().describe(
            'Address associated with the request. Statistics remain network-wide.'
          )
        })
      },
      async (_input) => {
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
