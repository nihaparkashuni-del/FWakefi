import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        nodePolyfills({
            include: ["buffer", "crypto", "stream", "util", "events", "path", "os"],
            globals: { Buffer: true, global: true, process: true },
        }),
    ],
    optimizeDeps: {
        esbuildOptions: {
            loader: { ".js": "jsx" },
        },
    },
});
