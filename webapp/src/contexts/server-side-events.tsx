import React, {
  createContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import {
  ApiSSEClient,
  SSEMessage,
  SSEPingMessage,
} from "../services/api-sse-client/ApiSSEClient";

type SSEConnectionStatus = "CONNECTING" | "OPEN" | "CLOSED";

interface SSEMessageInterface {
  timestamp: Date;
  event: "message";
  data: object | null;
  lastEventId?: string;
}

interface SSEContextInterface {
  lastMessage: SSEMessageInterface | null;
  messages: SSEMessageInterface[];
  connStatus: SSEConnectionStatus;
}

const SSEContext = createContext<SSEContextInterface>({
  lastMessage: null,
  messages: [],
  connStatus: "CONNECTING",
});

const SSEProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [lastMessage, setLastMessage] = useState<SSEMessageInterface | null>(
    null
  );
  const [messages, setMessages] = useState<SSEMessageInterface[]>([]);
  const [connStatus, setConnStatus] =
    useState<SSEConnectionStatus>("CONNECTING");

  useEffect(() => {
    const apiSSECli = new ApiSSEClient();
    console.debug(apiSSECli);

    const handleOpen = () => setConnStatus("OPEN");
    const handleConnecting = () => setConnStatus("CONNECTING");
    const handleClose = () => setConnStatus("CLOSED");
    const handleMessage = (msg: SSEMessage) => {
      msg.event;
      setLastMessage(msg);
      setMessages((msgs) => [...msgs, msg]);
    };

    const handlePing = (msg: SSEPingMessage) => {
      const { timestamp } = msg.data;
      console.debug(`ping ${msg.lastEventId} at ${timestamp}`);
    };

    apiSSECli.on("open", handleOpen);
    apiSSECli.on("connecting", handleConnecting);
    apiSSECli.on("close", handleClose);
    apiSSECli.on("message", handleMessage);
    // evtSource.addEventListener("ping", handlePing);

    return () => apiSSECli.destroy();
  }, []);

  useEffect(() => {
    console.debug("SSEProvider iniciado.");
    return () => console.debug("SSEProvider destruido.");
  }, []);

  return (
    <SSEContext.Provider value={{ lastMessage, messages, connStatus }}>
      {children}
    </SSEContext.Provider>
  );
};

export default { SSEContext, SSEProvider };
