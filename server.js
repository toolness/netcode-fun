require('@babel/register')({
  presets: [
    ["@babel/preset-env", {
      targets: {
        node: 'current',
      }
    }],
    "@babel/preset-typescript"
  ],
  extensions: ['.js', '.ts']
});

require('./src/server').run();
