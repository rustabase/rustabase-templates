import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tanstackStart(), viteReact()],
  // Shared components live outside this folder; resolve their packages from
  // this template's own install so the site builds on its own.
  resolve: { dedupe: ["react", "react-dom", "lucide-react"] },
});
