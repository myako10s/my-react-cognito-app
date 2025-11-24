import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
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
};
export default defineConfig(config);
