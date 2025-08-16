import { createWatchers } from './Watchers';
import htmlContent from './watchers.html?raw';
import React from 'react';

const baseArgs = {

};

export default {
  title: 'Example/Watchers',
  tags: ['autodocs'],
  render: (args) => {
    return createWatchers({ ...args });
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

      component="watchers"
      render-html="true"
      >
      
    </rosen-watcher-component>

  `;
}

export const Primary = {
  args: {
    
    
  },
   name: 'Show Watchers Component',
  parameters: {
    docs: {
      source: {
        
        code: buildSourceCode(baseArgs),
      },
    },
  },
};
