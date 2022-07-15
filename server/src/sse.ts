import { EventEmitter } from "events";
import { IncomingMessage, ServerResponse } from "http";

type ClientInfo = {
  userAgent: string;
  xForwardedFor: string;
  remoteAddress: string;
  remotePort: number;
};

enum SSEEvents {
  PING = "ping",
}

enum SSEClientEvents {
  CLOSE = "close",
}

class SSEClient extends EventEmitter {
  private readonly req: IncomingMessage;
  private readonly wStream: ServerResponse;
  private isConnOpen: boolean;
  private keepAliveCount = 0;
  private keepAliveTimeoutID: NodeJS.Timeout | null;
  readonly clientInfo: ClientInfo;

  constructor(req: IncomingMessage, wStream: ServerResponse) {
    super();
    this.req = req;
    this.wStream = wStream;
    this.isConnOpen = true;
    this.keepAliveTimeoutID = null;
    this.clientInfo = {
      userAgent: this.parseReqHeader(req.headers["user-agent"]),
      xForwardedFor: this.parseReqHeader(req.headers["x-forwarded-for"]),
      remoteAddress: req.socket.remoteAddress || "",
      remotePort: req.socket.remotePort || 0,
    };

    this.keepAlive();
    this.req.once("close", () => {
      this.isConnOpen = false;
      this.keepAliveTimeoutID !== null &&
        clearInterval(this.keepAliveTimeoutID);
      this.emit(SSEClientEvents.CLOSE);
    });
  }

  // TODO
  // setRetry(){}

  // TODO
  // keep-alive

  private parseReqHeader(headerVal?: string | string[]): string {
    switch (typeof headerVal) {
      case "undefined":
        return "";
      case "string":
        return headerVal;
      default:
        return headerVal.join(", ");
    }
  }

  private keepAlive() {
    if (!this.isConnOpen) {
      console.debug("conexão encerrada. Para keep-alive.");
      return;
    }

    const { keepAliveCount } = this;
    this.sendComment(keepAliveCount);
    this.keepAliveCount++;
    this.keepAliveTimeoutID = setTimeout(() => this.keepAlive(), 2500);
  }

  private sendComment(comment: string | number) {
    if (!this.isConnOpen) {
      console.warn("conexão encerrada");
      return;
    }

    this.wStream.write(`: ${comment}\n\n`);
  }

  sendMessage(evtData: any, id?: string | number) {
    if (!this.isConnOpen) {
      console.warn("conexão encerrada");
      return;
    }

    id !== undefined && this.wStream.write(`id: ${id}\n`);
    this.wStream.write(`data: ${evtData}\n\n`);
  }

  sendTypedEvent(evtName: string, evtData?: any, id?: string | number) {
    if (!this.isConnOpen) {
      console.warn("conexão encerrada");
      return;
    }

    id !== undefined && this.wStream.write(`id: ${id}\n`);
    this.wStream.write(`event: ${evtName}\n`);
    this.wStream.write(`data: ${evtData}\n\n`);
  }
}

export { SSEClient };
