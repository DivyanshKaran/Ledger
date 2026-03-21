import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { bindGlobalErrorTelemetry } from "@/lib/telemetry";

bindGlobalErrorTelemetry();

createRoot(document.getElementById("root")!).render(<App />);
