
import {
  ChainType,
  EventService,
  EventType
} from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loadToolDescription } from './tool-description.js';

export class ChainPerfStatsTool {
  private chainPerf: Record<ChainType, { chart: number }> | null = null;

  constructor(
    private eventService: EventService
  ) {
    this.eventService.subscribeToEvent(
      EventType.PerfChartChanged,
      (data: Record<ChainType, { chart: number }>) => {
        this.chainPerf = data;
      },
    );
  }

  register(server: McpServer): void {
    server.registerTool(
      'get_chain_perf',
      {
        description: loadToolDescription('get-chain-perf.md'),
        inputSchema: z.object({})
      },
      async () => {
        const chainPerfs = this.chainPerf;

        if (chainPerfs === null) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'Chain performance statistics are not available yet.'
              }
            ],
            isError: true
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(chainPerfs)
            }
          ],
          structuredContent: chainPerfs
        };
      }
    );
  }
}
