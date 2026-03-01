import { defineConfig } from "vite";

export default defineConfig({
  base: "/wow-tbc-route/",
  define: {
    __APP_BUILD_ID__: JSON.stringify(Date.now().toString(36)),
  },
});
