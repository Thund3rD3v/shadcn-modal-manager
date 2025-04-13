import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // or whatever your entry file is
  format: ["esm"],
  dts: true,
  outDir: "dist",
  splitting: false,
  clean: true,
  target: "esnext"
});
