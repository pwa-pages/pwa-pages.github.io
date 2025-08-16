/** @type { import('@storybook/html-vite').StorybookConfig } */
import { mergeConfig } from 'vite';

const config = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-docs"
  ],
  framework: {
    name: "@storybook/html-vite",
    options: {}
  },

  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      build: {
        // 🚀 Just bump the warning threshold (kB)
        chunkSizeWarningLimit: 2000
      }
    });
  }
};

export default config;
