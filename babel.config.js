// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    // plugins: ['nativewind/babel'], // <-- remove this line
  };
};
