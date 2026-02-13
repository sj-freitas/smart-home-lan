import "./styles.css";
import React from "react";
import { createRoot } from "react-dom/client";
import Application from "./application";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>,
);
