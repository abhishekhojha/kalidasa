// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // generates "types" entry in package.json
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "kalidas",
      fileName: (format) => `kalidas.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
