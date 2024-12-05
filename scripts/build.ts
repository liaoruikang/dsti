import { argv } from 'node:process';
import { parseArgs } from 'node:util';
import { execaSync } from 'execa';
import { rimrafSync } from 'rimraf';
import { resolve } from 'node:path';

const {
  values: { out, dev },
  positionals
} = parseArgs({
  args: argv.slice(2),
  options: {
    out: {
      type: 'string',
      short: 'o',
      default: 'dist'
    },
    dev: {
      type: 'boolean',
      default: false
    }
  },
  allowPositionals: true
});

const packageDir = 'packages/public';

if (!positionals.length) positionals.push('dsti');

positionals
  .map(target => resolve(packageDir, target))
  .forEach(target => {
    rimrafSync(resolve(target, out));
    execaSync(
      'pnpm',
      [
        'rollup',
        '-c',
        '--environment',
        `TARGET:${target},OUT:${out},DEV:${dev}`,
        '--configPlugin',
        'typescript={tsconfig: `tsconfig.node.json`}',
        ...(dev ? ['-w'] : [])
      ],
      { stdio: 'inherit' }
    );
  });
