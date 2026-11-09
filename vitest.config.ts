import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    reporters: ["junit", "verbose"],
    environment: "jsdom",
    globals: true,
    outputFile: {
      junit: "./junit.xml",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
