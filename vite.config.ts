import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "styled-components",
            {
              displayName: true,
              fileName: false,
            },
          ],
        ],
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    cors: true,
    port: 3000,
    https: false,
    strictPort: true,
    host: "0.0.0.0",
  },
  assetsInclude: ["**/*.tga"],
});
