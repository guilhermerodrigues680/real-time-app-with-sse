import { EventEmitter } from "events";
import { Readable, Writable } from "stream";

enum SSEEvents {
  PING = "ping",
}

enum SSEClientEvents {
  CLOSE = "close",
}

class SSEClient extends EventEmitter {
  private readonly req: Readable;
  private readonly wStream: Writable;
  private connOpen = true;
  private pingCount = 0;

  constructor(req: Readable, wStream: Writable) {
    super();
    this.req = req;
    this.wStream = wStream;

    this.sendPing();
    this.req.once("close", () => {
      this.connOpen = false;
      this.emit(SSEClientEvents.CLOSE);
    });
  }

  // TODO
  // setRetry(){}

  // TODO
  // keep-alive

  private handleClose() {
    console.debug("conn closed");
  }

  private sendPing() {
    if (!this.connOpen) {
      console.warn("conexão encerrada. Para ping");
      return;
    }

    const { pingCount } = this;
    this.sendTypedEvent(
      SSEEvents.PING,
      JSON.stringify({ timestamp: new Date() }),
      pingCount
    );
    this.sendComment(pingCount);
    this.pingCount++;
    setTimeout(() => this.sendPing(), 2500);
  }

  private handleWriteError(error: Error | null | undefined) {
    if (error) {
      console.debug(error);
    }
  }

  private sendComment(comment: string | number) {
    if (!this.connOpen) {
      console.warn("conexão encerrada");
      return;
    }

    this.wStream.write(`: ${comment}\n\n`, this.handleWriteError);
  }

  sendMessage(evtData: any, id?: string | number) {
    if (!this.connOpen) {
      console.warn("conexão encerrada");
      return;
    }

    id !== undefined &&
      this.wStream.write(`id: ${id}\n`, this.handleWriteError);
    this.wStream.write(`data: ${evtData}\n\n`, this.handleWriteError);
  }

  sendTypedEvent(evtName: string, evtData?: any, id?: string | number) {
    if (!this.connOpen) {
      console.warn("conexão encerrada");
      return;
    }

    id !== undefined &&
      this.wStream.write(`id: ${id}\n`, this.handleWriteError);
    this.wStream.write(`event: ${evtName}\n`, this.handleWriteError);
    this.wStream.write(`data: ${evtData}\n\n`, this.handleWriteError);
  }
}

export { SSEClient };
