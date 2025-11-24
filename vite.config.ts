import react from "@vitejs/plugin-react";
import { defineConfig, type UserConfig } from "vite";

const config = {
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  test: {
    environment: "jsdom",
    globals: true
  }
} satisfies UserConfig & { test: Record<string, unknown> };

export default defineConfig(config);
