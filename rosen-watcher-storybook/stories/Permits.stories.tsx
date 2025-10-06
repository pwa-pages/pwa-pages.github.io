import { createPermits } from './Permits';
import htmlContent from './permits.html?raw';
import React from 'react';
import { rosenScriptFile, rosenStyleFile } from '../.storybook/preview';

const baseArgs = {
  address1: '9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38',
  address2: '9gnew46Ts9wZQWmbMWTebJE1yhqc1FAMXt3qQa8LjW3Uu7D4KnD',
  address3: '9ehyh2Ti9kBvnodWsafHhzT5557eTwWsKLdvRFhipmLmWAqYhAv',
  address4: '9htrN7JGgi8bxABJLCCskWqAHpatQqttFUF6GY68yaEbahG5Vx6',
};

var content = htmlContent
          .replace(/__SCRIPT_FILE__/g, rosenScriptFile)
          .replace(/__STYLE_FILE__/g, rosenStyleFile);

export default {
  title: 'Components/Permits',
  tags: ['autodocs'],
  render: (args) => {
    return createPermits({ ...args });
  },
  argTypes: {
    address1: { control: 'text' },
    address2: { control: 'text' },
    address3: { control: 'text' },
    address4: { control: 'text' },

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

      component="permits"
      render-html="true"
      address1="${args.address1 || ''}"
      address2="${args.address2 || ''}"
      address3="${args.address3 || ''}"
      address4="${args.address4 || ''}"
      >
      
    </rosen-watcher-component>

  `;
}

export const Primary = {
  args: {
    
    address1: '9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38',
  address2: '9gnew46Ts9wZQWmbMWTebJE1yhqc1FAMXt3qQa8LjW3Uu7D4KnD',
  address3: '9ehyh2Ti9kBvnodWsafHhzT5557eTwWsKLdvRFhipmLmWAqYhAv',
  address4: '9htrN7JGgi8bxABJLCCskWqAHpatQqttFUF6GY68yaEbahG5Vx6',
  },
   name: 'Explore Component',
  parameters: {
    docs: {
      source: {
        
        code: buildSourceCode(baseArgs),
      },
    },
  },
};
