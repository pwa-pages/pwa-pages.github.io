module.exports = {
  stories: ['../stories/**/*.stories.js'],
  staticDirs: ['../web-components'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  core: {
    builder: 'storybook-builder-vite',
  },
};

