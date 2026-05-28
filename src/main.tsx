import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Remove preloader after app mounts
const removePreloader = () => {
  const el = document.getElementById("preloader");
  if (el) {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.4s ease";
    setTimeout(() => el.remove(), 400);
  }
};

createRoot(document.getElementById("root")!).render(<App />);
removePreloader();
