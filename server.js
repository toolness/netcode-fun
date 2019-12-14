require('@babel/register')({
  presets: [
    ["@babel/preset-env", {
      targets: {
        node: 'current',
      }
    }],
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-proposal-nullish-coalescing-operator",
  ],
  extensions: ['.js', '.ts']
});

require('./src/server').run();
