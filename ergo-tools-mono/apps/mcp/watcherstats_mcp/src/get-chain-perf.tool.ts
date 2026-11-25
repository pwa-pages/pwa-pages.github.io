
import {
  ChainType,
  EventService,
  EventType,
  hotWalletAddress,
  ProcessEventService
} from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loadToolDescription } from './tool-description.js';

export class ChainPerfStatsTool {
  private chainPerf: Record<ChainType, { chart: number }> | null = null;
  ready: boolean = false;

  constructor(
    private eventService: EventService,
    private processEventService: ProcessEventService
  ) {
    this.eventService.subscribeToEvent(
      EventType.ChainPerfChartChanged,
      (data: Record<ChainType, { chart: number }>) => {
        this.chainPerf = data;
      },
    );

    this.eventService.subscribeToEvent(
      EventType.EndFullDownload,
      async (data: string) => {
        if (data === hotWalletAddress) {
          this.ready = true;
        }
      }
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

        this.ready = false;

        setImmediate(() => {
          void this.processEventService
            .processEvent({
              data: null,
              type: EventType.ChainPerformanceRequested
            })
            .catch((error) => {
              console.error(
                '[ChainPerfStatsTool] Background event failed:',
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
                text: 'Chain performance stats were not available after 10 seconds.'
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
