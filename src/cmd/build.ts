import { build, BuildOptions, stop } from "../deps/esbuild.ts";

export const options: BuildOptions = {
  bundle: true,
  platform: "neutral",
  sourcemap: true,
};

const files = ["bare", "core", "css", "jot"];

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

  await Promise.all(
    files.map(async (file) => {
      const src = `dist/${file}.js`;
      const text = await Deno.readTextFile(src);

      await Deno.writeTextFile(
        src,
        `// @ts-self-types="../src/main/${file}.ts"\n`,
      );

      await Deno.writeTextFile(src, text, { append: true });
    }),
  );

  await stop();
}
