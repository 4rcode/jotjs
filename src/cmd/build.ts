import { build, BuildOptions, stop } from "../deps/esbuild.ts";

export const options: BuildOptions = {
  bundle: true,
  platform: "neutral",
  sourcemap: true,
};

const files = ["core", "css", "jot"];

if (import.meta.main) {
  await Promise.all(
    files.map(
      async (file) =>
        await build({
          ...options,
          minify: true,
          outfile: `dist/${file}.js`,
          entryPoints: [`src/main/${file}.ts`],
        }),
    ),
  );

  await stop();
}
