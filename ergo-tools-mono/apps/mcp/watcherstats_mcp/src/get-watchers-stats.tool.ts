import { EventService, EventType, WatchersStats } from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

export class GetWatchersStatsTool {

  private watchersStats: WatchersStats | null = null;

  constructor(
    private eventService: EventService
  ) {
    this.eventService.subscribeToEvent(
      EventType.WatchersStatsChanged,
      (data: WatchersStats) => {
        this.watchersStats = data;
      },
    );
  }

  register(server: McpServer): void {
    server.registerTool(
      'get_watchers_stats',
      {
        description: 'Get the latest watcher statistics',
        inputSchema: z.object({})
      },
      async () => {
        const watchersStats = JSON.parse(JSON.stringify(this.watchersStats));;
        if (watchersStats === null) {
          return {
            content: [
              {
                type: 'text',
                text: 'Watcher statistics are not available yet.'
              }
            ],
            isError: true
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(watchersStats)
            }
          ],
          structuredContent: watchersStats
        };
      }
    );
  }
}
