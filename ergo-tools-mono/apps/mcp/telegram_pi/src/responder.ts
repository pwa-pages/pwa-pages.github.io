export interface MessageRequest {
  text: string;
  userId: number;
  chatId: number;
  username?: string;
}

export interface Responder {
  respond(request: MessageRequest): Promise<string>;
}

export class EchoResponder implements Responder {
  async respond(request: MessageRequest): Promise<string> {
    return `You said: ${request.text}`;
  }
}