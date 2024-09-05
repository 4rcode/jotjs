import { context } from "../deps/esbuild.ts";

const server = await (
  await context({
    bundle: true,
    entryPoints: ["src/example/index.ts"],
    outdir: "src/example",
  })
).serve({
  servedir: "src/example",
  host: "127.0.0.1",
  port: 8080,
});

console.log(`http://${server.host}:${server.port}`);
