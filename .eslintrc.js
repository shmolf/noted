module.exports = {
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-use-before-define': ['error', { functions: false, classes: false }],
    'prefer-destructuring': ['warn', { object: true, array: false }],
    'max-len': [2, 120, 4],
    'import/no-extraneous-dependencies': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-param-reassign': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  ignorePatterns: [
    'webpack.config.js',
    '**/node_modules/*',
    'public/**/*',
  ],
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['SCRIPTS', './assets/scripts/'],
          ['STYLES', './assets/styles/'],
          ['NODE', './node_modules/'],
          ['IMAGES', './assets/images/'],
        ],
        extensions: ['.ts'],
      },
    },
  },
};
