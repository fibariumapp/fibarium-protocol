module.exports = {
    env: {
        commonjs: true,
        es6: true,
    },
    parserOptions: {
        ecmaVersion: 2020,
    },
    extends: ['plugin:prettier/recommended', 'prettier'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    plugins: ['prettier'],
};
