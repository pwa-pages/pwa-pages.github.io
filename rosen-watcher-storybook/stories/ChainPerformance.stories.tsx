import { createChainPerformance } from './ChainPerformance';
import htmlContent from './chainperformance.html?raw';
import React from 'react';
import { rosenScriptFile, rosenStyleFile } from '../.storybook/preview';

const baseArgs = {

};

var content = htmlContent
          .replace(/__SCRIPT_FILE__/g, rosenScriptFile)
          .replace(/__STYLE_FILE__/g, rosenStyleFile);

export default {
  title: 'Components/ChainPerformance',
  tags: ['autodocs'],
  render: (args) => {
    return createChainPerformance({ ...args });
  },
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  
  args: baseArgs,
    parameters: {
  docs: {
    page: () => (
      <div
        dangerouslySetInnerHTML={{ __html: content }}
      />
    ),
  },
}
};


function buildSourceCode(args) {
  return `

    <rosen-watcher-component

      component="chain-performance"
      render-html="true"
      >
      
    </rosen-watcher-component>

  `;
}

export const Primary = {
  name: 'Chain performance Component',
  args: {
    
    
  },
  parameters: {
    docs: {
      source: {
        
        code: buildSourceCode(baseArgs),
      },
    },
  },
};
