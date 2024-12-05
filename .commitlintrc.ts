import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';
import { globSync } from 'glob';
import { basename } from 'node:path';

export default <UserConfig>{
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      RuleConfigSeverity.Error,
      'always',
      globSync('packages/public/*/').map(pkg => basename(pkg))
    ],
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      ['feat', 'chore', 'release', 'fix', 'test', 'refactor']
    ]
  }
};
