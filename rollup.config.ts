import {
  defineConfig,
  type Plugin,
  type OutputOptions,
  type RollupOptions,
  type ExternalOption
} from 'rollup';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { readPackageJSON } from 'pkg-types';
import { resolve } from 'node:path';
import nodeResolve from '@rollup/plugin-node-resolve';

const TARGET = process.env.TARGET;
const OUT = process.env.OUT;
const dev = process.env.DEV === 'true';

const pkg = await readPackageJSON(resolve(TARGET));
if (!pkg.main) throw new Error('main is not defined in package.json');

const input = resolve(TARGET, pkg.main);
const outDir = resolve(TARGET, OUT);

const outputs: Record<BuildFormat, OutputOptions> = {
  cjs: {
    file: `${outDir}/index.cjs`,
    format: 'commonjs',
    exports: 'named',
    sourcemap: dev
  },
  esm: {
    file: `${outDir}/index.mjs`,
    format: 'esm',
    sourcemap: dev
  },
  iife: {
    file: `${outDir}/index.global.js`,
    format: 'iife',
    exports: 'named',
    name: pkg.buildOptions?.name ?? 'dsti',
    sourcemap: dev
  }
};

const createConfig = (
  output: BuildFormat | OutputOptions | BuildFormat[] | OutputOptions[],
  plugins: Plugin[] = []
): RollupOptions => {
  if (Array.isArray(output))
    output = output.map(o => (typeof o === 'string' ? outputs[o] : o));
  else if (typeof output === 'string') output = [outputs[output]];
  else output = [output];

  let external: ExternalOption = [];
  if (output.some(o => o.format === 'iife'))
    output.length > 1 &&
      plugins.push({
        name: 'iife-warn',
        buildStart() {
          this.warn(
            `The current output format is 'life' and the option 'external' will be ignored`
          );
        }
      });
  else if (!dev)
    external = Object.keys(pkg.dependencies ?? {}).filter(
      dep => !pkg.buildOptions?.internal?.includes(dep)
    );

  return {
    input,
    external,
    output,
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.app.json'
      }),
      ...plugins
    ]
  };
};

export default defineConfig([
  createConfig('iife'),
  createConfig(['cjs', 'esm']),
  createConfig(
    {
      file: `${outDir}/index.d.ts`
    },
    [
      dts({
        tsconfig: './tsconfig.app.json',
        respectExternal: true
      })
    ]
  )
]);
