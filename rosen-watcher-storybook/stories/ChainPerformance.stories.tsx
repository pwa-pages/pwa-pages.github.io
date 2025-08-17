import { createChainPerformance } from './ChainPerformance';
import htmlContent from './chainperformance.html?raw';
import React from 'react';

const baseArgs = {

};

export default {
  title: 'Example/ChainPerformance',
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
        dangerouslySetInnerHTML={{ __html: htmlContent }}
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
