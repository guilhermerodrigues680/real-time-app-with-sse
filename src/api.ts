import { Router } from "express";
import { SSEClient } from "./sse";

const api = Router();

api.get("/api", (req, res) => {
  res.json({ message: "hello world with Typescript" });
});

/**
 * https://developer.mozilla.org/pt-BR/docs/Web/API/Server-sent_events/Using_server-sent_events
 * https://stackoverflow.com/questions/34657222/how-to-use-server-sent-events-in-express-js
 * https://masteringjs.io/tutorials/express/server-sent-events
 */
api.get("/api/streaming", async (req, res) => {
  console.log("Got /api/streaming");
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  // Tell the client to retry every 10 seconds if connectivity is lost
  // res.write("retry: 10000\n\n");
  const sseCli = new SSEClient(req, res);
  console.log(
    "New SSE Client:",
    `${sseCli.clientInfo.remoteAddress}:${sseCli.clientInfo.remotePort}`,
    sseCli.clientInfo.userAgent
  );

  let connOpen = true;
  sseCli.once("close", () => {
    connOpen = false;
  });

  let count = 0;

  while (connOpen) {
    count++;
    // console.log("Emit", count);
    // Emit an SSE that contains the current 'count' as a string
    sseCli.sendMessage(count);
    // Emit um evento tipado PING.
    // Observe que isso não é necessário, o SSEClient possui uma rotina de keep-alive
    sseCli.sendTypedEvent(
      "ping",
      JSON.stringify({ timestamp: new Date() }),
      count
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(
    "Close SSE Client:",
    `${sseCli.clientInfo.remoteAddress}:${sseCli.clientInfo.remotePort}`,
    sseCli.clientInfo.userAgent
  );
});

export default api;
