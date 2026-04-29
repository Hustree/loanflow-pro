export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'apply',
        'manage',
        'theme',
        'i18n',
        'infra',
        'docs',
        'brand',
        'test',
        'ci',
        'deps',
        'release',
      ],
    ],
    'subject-case': [0],
    'scope-empty': [0],
  },
};
