
import {
  EventService,
  EventType,
  Input,
  ProcessEventService,
} from '@ergo-tools/service';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loadToolDescription } from './tool-description.js';

export class GetAddressStatisticsTool {
  inputs: Input[] | undefined;
  private readonly readyAddresses = new Set<string>();

  constructor(
    private eventService: EventService,
    private processEventService: ProcessEventService
  ) {

    this.eventService.subscribeToEvent(
      EventType.InputsChanged,
      async (data: Input[]) => {
        this.inputs = data;
      }
    );

    this.eventService.subscribeToEvent(
      EventType.EndFullDownload,
      async (data: string) => {
        this.readyAddresses.add(data);
      }
    );
  }

  isReady(address: string): boolean {
    return this.inputs !== undefined && this.readyAddresses.has(address);
  }

  register(server: McpServer): void {
    server.registerTool(
      'get_address_statistics',
      {
        description: loadToolDescription(
          'get-address-statistics.md'
        ),
        inputSchema: z.object({
          address: z.string().describe('Watcher address'),
          startDate: z.iso.date().optional().describe(
            'Include rewards on or after this UTC date (YYYY-MM-DD)'
          ),
          endDate: z.iso.date().optional().describe(
            'Include rewards on or before this UTC date (YYYY-MM-DD)'
          )
        })
      },
      async ({ address, startDate, endDate, }) => {
        if (startDate && endDate && startDate > endDate) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'Start date must be on or before end date.'
              }
            ],
            isError: true
          };
        }

        // Schedule event processing without waiting for it.
        setImmediate(() => {
          this.readyAddresses.delete(address);
          void this.processEventService
            .processEvent({
              data: address as unknown as object,
              type: EventType.RequestInputsDownload
            })
            .catch((error) => {
              console.error(
                '[GetAddressStatisticsTool] Background event failed:',
                error
              );
            });
        });

        const deadline = Date.now() + 10_000;
        while (!this.isReady(address) && Date.now() < deadline) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (!this.isReady(address)) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'Address statistics were not available after 10 seconds.'
              }
            ],
            isError: true
          };
        }

        try {
          const startTimestamp = startDate
            ? Date.parse(`${startDate}T00:00:00.000Z`)
            : Number.NEGATIVE_INFINITY;
          const endTimestampExclusive = endDate
            ? Date.parse(`${endDate}T00:00:00.000Z`) + 24 * 60 * 60 * 1000
            : Number.POSITIVE_INFINITY;
          const rewards = this.inputs
            .filter((input) => input.outputAddress === address)
            .map((input, index) => {
              if (typeof input.amount !== 'number' || !Number.isFinite(input.amount)) {
                throw new Error(`Input ${index} has an invalid amount`);
              }
              if (!(input.inputDate instanceof Date) || !Number.isFinite(input.inputDate.getTime())) {
                throw new Error(`Input ${index} has an invalid input date`);
              }

              return {
                inputDate: input.inputDate.toISOString(),
                amount: input.amount
              };
            })
            .filter(({ inputDate }) => {
              const timestamp = Date.parse(inputDate);
              return timestamp >= startTimestamp && timestamp < endTimestampExclusive;
            });
          const serialized = JSON.stringify(rewards);
          const structuredAddressStatistics = { rewards };

          console.log(
            '[GetAddressStatisticsTool] Returning statistics:',
            structuredAddressStatistics
          );

          return {
            content: [
              {
                type: 'text' as const,
                text: serialized
              }
            ],
            structuredContent: structuredAddressStatistics
          };

        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : String(error);

          console.error(
            '[GetAddressStatisticsTool] Error:',
            error
          );

          return {
            content: [
              {
                type: 'text' as const,
                text: `Failed to retrieve address statistics: ${message}`
              }
            ],
            isError: true
          };
        }
      }
    );
  }
}
