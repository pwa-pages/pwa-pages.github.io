
import {
  EventService,
  EventType,
  ProcessEventService,
} from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loadToolDescription } from './tool-description.js';

export class GetAddressPerformanceTool {
  addressCharts: Record<string, { chainType: string | null; charts: Record<number, number>; }>;

  constructor(
    private eventService: EventService,
    private processEventService: ProcessEventService
  ) {

    this.eventService.subscribeToEvent(
      EventType.AddressChartChanged,
      async (
        a: Record<
          string,
          { chainType: string | null; charts: Record<number, number> }
        >,
      ) => {
        this.addressCharts = Object.keys(a).reduce(
          (acc, key) => {
            acc[key] = a[key];
            return acc;
          },
          {} as Record<
            string,
            { chainType: string | null; charts: Record<number, number> }
          >,
        );

      },
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

        this.processEventService.processEvent({
          data: address as unknown as object,
          type: EventType.RequestInputsDownload
        }
        );

        const addressCharts = this.addressCharts;

        if (addressCharts === null || addressCharts === undefined) {
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
          // Serialize to JSON.
          const serialized = JSON.stringify(addressCharts[address]);

          if (serialized === undefined) {
            throw new Error(
              'AddressCharts cannot be serialized to JSON'
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
