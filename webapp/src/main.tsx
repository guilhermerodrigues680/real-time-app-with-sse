import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import sse from "./contexts/server-side-events";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <sse.SSEProvider>
      <App />
    </sse.SSEProvider>
  </React.StrictMode>
);
