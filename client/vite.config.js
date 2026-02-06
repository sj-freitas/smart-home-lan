import { defineConfig } from "vite";
import dns from "node:dns";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  server: {
    allowedHosts: [
      "www.palais-freitas.xyz",
      "palais-freitas.xyz",
      "website-4gnq.onrender.com",
      "www.website-4gnq.onrender.com",
    ]
  },
});
