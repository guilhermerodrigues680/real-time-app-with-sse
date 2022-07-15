import React, {
  createContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";

interface SSEMessageInterface {
  timestamp: Date;
  event: string | null;
  data: object | null;
}

interface SSEContextInterface {
  lastMessage: SSEMessageInterface | null;
  messages: SSEMessageInterface[];
}

const SSEContext = createContext<SSEContextInterface>({
  lastMessage: null,
  messages: [],
});

const SSEProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [lastMessage, setLastMessage] = useState<SSEMessageInterface | null>(
    null
  );
  const [messages, setMessages] = useState<SSEMessageInterface[]>([]);

  useEffect(() => {
    const evtSource = new EventSource("http://localhost:5170/api/streaming");

    const handleOpen = (event: MessageEvent) => {
      console.info("[SSE] open", event.data);
    };

    const handleError = (event: MessageEvent) => {
      console.error("[SSE] error", event.data);
    };

    const handleMessage = (event: MessageEvent) => {
      console.debug(event.data);
      const msg = {
        data: event.data,
        event: "message",
        timestamp: new Date(),
      };
      setLastMessage(msg);
      setMessages((msgs) => [...msgs, msg]);
    };

    const handlePing = (event: MessageEvent) => {
      type PingMessage = { timestamp: Date };

      const pingMessage = JSON.parse(event.data) as PingMessage;
      const { timestamp } = pingMessage;
      console.debug(`ping ${event.lastEventId} at ${timestamp}`);
    };

    evtSource.addEventListener("open", handleOpen);
    evtSource.addEventListener("error", handleError);
    evtSource.addEventListener("message", handleMessage);
    evtSource.addEventListener("ping", handlePing);
    return () => {
      evtSource.close();
      evtSource.removeEventListener("open", handleOpen);
      evtSource.removeEventListener("error", handleError);
      evtSource.removeEventListener("message", handleMessage);
      evtSource.removeEventListener("ping", handlePing);
    };
  }, []);

  useEffect(() => {
    console.debug("SSEProvider iniciado.");
    return () => console.debug("SSEProvider destruido.");
  }, []);

  return (
    <SSEContext.Provider value={{ lastMessage, messages }}>
      {children}
    </SSEContext.Provider>
  );
};

export default { SSEContext, SSEProvider };
