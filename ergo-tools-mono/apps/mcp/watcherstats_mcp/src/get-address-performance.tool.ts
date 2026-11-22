
import {
  EventService,
  EventType,
  ProcessEventService,
} from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loadToolDescription } from './tool-description.js';

type AddressPerformance = {
  chainType: string | null;
  charts: Record<number, number>;
};

export class GetAddressPerformanceTool {
  addressCharts: Record<string, AddressPerformance> = {};

  constructor(
    private eventService: EventService,
    private processEventService: ProcessEventService
  ) {
    this.eventService.subscribeToEvent(
      EventType.AddressChartChanged,
      async (data: Record<string, AddressPerformance>) => {
        this.addressCharts = { ...data };
      }
    );
  }

  register(server: McpServer): void {
    server.registerTool(
      'get_address_performance',
      {
        description: loadToolDescription(
          'get-address-performance.md'
        ),
        inputSchema: z.object({
          address: z.string().describe('Watcher address')
        })
      },
      async ({ address }) => {
        // Schedule event processing without waiting for it.
        setImmediate(() => {
          void this.processEventService
            .processEvent({
              data: address as unknown as object,
              type: EventType.RequestInputsDownload
            })
            .catch((error) => {
              console.error(
                '[GetAddressPerformanceTool] Background event failed:',
                error
              );
            });
        });

        // Read currently cached performance data.
        const performance = this.addressCharts[address];

        if (!performance) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'Address performance not available yet.'
              }
            ],
            isError: true
          };
        }

        try {
          const serialized = JSON.stringify(performance);

          if (serialized === undefined) {
            throw new Error(
              'AddressCharts cannot be serialized to JSON'
            );
          }

          const parsed: unknown = JSON.parse(serialized);

          if (
            parsed === null ||
            typeof parsed !== 'object' ||
            Array.isArray(parsed)
          ) {
            throw new Error(
              'AddressCharts must serialize to a JSON object. ' +
              `Received: ${serialized}`
            );
          }

          const structuredAddressPerformance =
            parsed as Record<string, unknown>;

          console.log(
            '[GetAddressPerformanceTool] Returning performance:',
            structuredAddressPerformance
          );

          return {
            content: [
              {
                type: 'text' as const,
                text: serialized
              }
            ],
            structuredContent: structuredAddressPerformance
          };

        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : String(error);

          console.error(
            '[GetAddressPerformanceTool] Error:',
            error
          );

          return {
            content: [
              {
                type: 'text' as const,
                text: `Failed to retrieve address performance: ${message}`
              }
            ],
            isError: true
          };
        }
      }
    );
  }
}
