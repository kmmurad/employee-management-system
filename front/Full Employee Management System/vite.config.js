import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7188',
        changeOrigin: true,
        secure: false,
        // If you get HTTPS errors, use this:
        // configure: (proxy) => {
        //   proxy.on('error', (err) => {
        //     console.log('proxy error', err);
        //   });
        // },
      }
    }
  }
});