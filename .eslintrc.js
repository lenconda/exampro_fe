module.exports = {
  extends: [
    'eslint-config-alloy/react',
    'eslint-config-alloy/typescript'
  ],
  plugins: [
    'react-hooks',
    'import',
  ],
  globals: {
    STUN_SERVER: true,
    TURN_SERVER: true,
    TURN_SERVER_CREDENTIAL: true,
    TURN_SERVER_USERNAME: true,
    SVGInject: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
  },
  rules: {
    indent: [
      'error',
      2
    ],
    'import/order': ['error', {
      groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin', 'object'],
    }],
    '@typescript-eslint/indent': 'off',
    'react/jsx-indent-props': [
      'error',
      2
    ],
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/typedef': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'react/jsx-indent': [
      'error',
      2
    ],
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'eol-last': 2,
    quotes: [2, 'single'],
    'jsx-quotes': ['error', 'prefer-double'],
    'complexity': 'off',
    'max-nested-callbacks': 'off',
  }
};
