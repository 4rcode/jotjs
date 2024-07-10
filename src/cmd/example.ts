import { context } from "../deps/esbuild.ts";

const server = await (
  await context({})
).serve({
  servedir: ".",
  host: "127.0.0.1",
  port: 8080,
});

console.log(`http://${server.host}:${server.port}`);
