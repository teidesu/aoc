import process from 'node:process'

import antfu from '@antfu/eslint-config'

export default antfu({
    stylistic: {
        indent: 4,
    },
    typescript: true,
    yaml: false,
    rules: {
        'antfu/no-top-level-await': 'off',
        'eslint-comments/no-unlimited-disable': 'off',
        'no-cond-assign': 'off',
        'style/indent': ['error', 4, {
            offsetTernaryExpressions: false,
            // the rest is from default config: https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/configs/customize.ts
            ArrayExpression: 1,
            CallExpression: { arguments: 1 },
            flatTernaryExpressions: false,
            FunctionDeclaration: { body: 1, parameters: 1 },
            FunctionExpression: { body: 1, parameters: 1 },
            ignoreComments: false,
            ignoredNodes: [
                'TemplateLiteral *',
                'TSUnionType',
                'TSIntersectionType',
                'TSTypeParameterInstantiation',
                'FunctionExpression > .params[decorators.length > 0]',
                'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
            ],
            ImportDeclaration: 1,
            MemberExpression: 1,
            ObjectExpression: 1,
            outerIIFEBody: 1,
            SwitchCase: 1,
            VariableDeclarator: 1,
        }],
        'curly': ['error', 'multi-line'],
        'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
        'n/prefer-global/process': 'off',
        'no-console': 'off',
        'style/quotes': ['error', 'single', { avoidEscape: true }],
        'test/consistent-test-it': 'off',
        'test/prefer-lowercase-title': 'off',
        'antfu/if-newline': 'off',
        'import/no-relative-packages': 'error',
        'style/max-statements-per-line': ['error', { max: 2 }],
        'ts/no-redeclare': 'off',
        'unused-imports/no-unused-imports': 'error',
        'import/extensions': ['error', 'always', {
            ignorePackages: true,
            checkTypeImports: true,
        }],
        'no-labels': 'off',
        'no-restricted-syntax': ['error', 'WithStatement'],
        'ts/promise-function-async': 'off',
        'ts/no-unnecessary-type-assertion': 'off',
        ...(process.env.CI
            ? {
                'dot-notation': 'error',
                'ts/dot-notation': 'off',
            }
            : {}
        ),
    },
})
