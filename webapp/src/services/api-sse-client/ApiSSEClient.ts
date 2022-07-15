import mitt, { Emitter } from "mitt";

type ApiSSEClientEvents = {
  open: undefined;
  connecting: undefined;
  close: undefined;
  message: SSEMessage;
  ping: SSEPingMessage;
};

interface SSEMessageInterface {
  timestamp: Date;
  event: string;
  data: object | null;
  lastEventId?: string;
}

type SSEPingMessageData = SSEMessageInterface & {
  timestamp: Date;
};

type SSEPingMessage = SSEMessageInterface & {
  event: "ping";
  data: SSEPingMessageData;
};

type SSEMessage = SSEMessageInterface & { event: "message" };

class ApiSSEClient {
  private readonly evtSource: EventSource;
  private readonly evtEmitter: Emitter<ApiSSEClientEvents>;

  constructor() {
    // this.evtSource = new EventSource("http://localhost:5170/api/streaming");
    this.evtSource = new EventSource(
      "https://real-time-app-with-sse-server.guilhermerodri8.repl.co/api/streaming"
    );
    console.debug(this.evtSource);
    this.evtEmitter = mitt();
    this.evtSource.addEventListener("open", this.handleOpen);
    this.evtSource.addEventListener("error", this.handleError);
    this.evtSource.addEventListener("message", this.handleMessage);
    this.evtSource.addEventListener("ping", this.handlePing);
  }

  public get on() {
    return this.evtEmitter.on;
  }

  public get off() {
    return this.evtEmitter.off;
  }

  public destroy() {
    this.evtSource.close();
    this.evtEmitter.emit("close");
    this.evtSource.removeEventListener("open", this.handleOpen);
    this.evtSource.removeEventListener("error", this.handleError);
    this.evtSource.removeEventListener("message", this.handleMessage);
    this.evtSource.removeEventListener("ping", this.handlePing);
    this.evtEmitter.all.clear();
  }

  private handleOpen = (event: MessageEvent) => {
    console.info("[SSE] open", event.data);
    this.evtEmitter.emit("open");
  };

  private handleError = (event: MessageEvent) => {
    console.error("[SSE] error", event.data);
    // Após um erro o EventSource tenta reconectar automaticamente
    this.evtEmitter.emit("connecting");
  };

  private handleMessage = (event: MessageEvent) => {
    console.debug(event.data);
    const msg: SSEMessage = {
      data: event.data,
      event: "message",
      timestamp: new Date(),
    };

    this.evtEmitter.emit("message", msg);
  };

  private handlePing = (event: MessageEvent) => {
    const pingMsgData = JSON.parse(event.data) as SSEPingMessageData;
    const { timestamp } = pingMsgData;
    console.debug(`ping ${event.lastEventId} at ${timestamp}`);

    const msg: SSEPingMessage = {
      data: pingMsgData,
      event: "ping",
      timestamp: new Date(),
      lastEventId: event.lastEventId,
    };
    this.evtEmitter.emit("ping", msg);
  };
}

export type { SSEMessage, SSEPingMessage };
export { ApiSSEClient };
export default ApiSSEClient;
