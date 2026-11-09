import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

async function enableMocking() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    const { worker } = await import("./mocks/browser");
    await worker.start();
    console.log("Mock Service Worker started");
  } catch (error) {
    console.error("Failed to start Mock Service Worker:", error);
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
