import { createWatchers } from './Watchers';
import htmlContent from './watchers.html?raw';
import React from 'react';
import { rosenScriptFile, rosenStyleFile } from '../.storybook/preview';

const baseArgs = {

};

var content = htmlContent
          .replace(/__SCRIPT_FILE__/g, rosenScriptFile)
          .replace(/__STYLE_FILE__/g, rosenStyleFile);

export default {
  title: 'Components/Watchers',
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
        dangerouslySetInnerHTML={{ __html: content }}
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
   name: 'Watchers Component',
  parameters: {
    docs: {
      source: {
        
        code: buildSourceCode(baseArgs),
      },
    },
  },
};
