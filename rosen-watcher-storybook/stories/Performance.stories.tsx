import { createPerformance } from './Performance';
import htmlContent from './performance.html?raw';
import React from 'react';
import { rosenScriptFile, rosenStyleFile } from '../.storybook/preview';

const baseArgs = {
  address1: '9fMuCRJ9mBok5K43Qb8Ddx3rBnoHbvg82d7wAsBW33CPz9ioLS3',
  address2: '9fTF3gDacgsi5BhpcgKrGQtGMr93VTkZaH6tZFG8zJAMe44EaGm',
  address3: '9ha6v36nv7p3mVRsVPnMajGmASbY6Etz4ba3MqfgZy4D2zvvPxg',
  address4: '9ehyh2Ti9kBvnodWsafHhzT5557eTwWsKLdvRFhipmLmWAqYhAv',
  accentChartColor: '#666666',
};

var content = htmlContent
          .replace(/__SCRIPT_FILE__/g, rosenScriptFile)
          .replace(/__STYLE_FILE__/g, rosenStyleFile);

export default {
  title: 'Components/Performance',
  tags: ['autodocs'],
  render: (args) => {
    return createPerformance({ ...args });
  },
  argTypes: {
    backgroundColor: { control: 'color' },
    accentChartColor: { control: 'color' },
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
},
  
};

function buildSourceCode(args) {
  return `

    <rosen-watcher-component
      style="display: block; width: 500px; height: 300px; float: left"
      component="performance"
      address1="${args.address1 || ''}"
      address2="${args.address2 || ''}"
      address3="${args.address3 || ''}"
      address4="${args.address4 || ''}"
      render-html="true"
      accent-chart-color="${args.accentChartColor || ''}"      >
      
    </rosen-watcher-component>

  `;
}

export const Primary = {
  name: 'Explore Component',
  args: {
  address1: '9fMuCRJ9mBok5K43Qb8Ddx3rBnoHbvg82d7wAsBW33CPz9ioLS3',
  address2: '9fTF3gDacgsi5BhpcgKrGQtGMr93VTkZaH6tZFG8zJAMe44EaGm',
  address3: '9ha6v36nv7p3mVRsVPnMajGmASbY6Etz4ba3MqfgZy4D2zvvPxg',
  address4: '9ehyh2Ti9kBvnodWsafHhzT5557eTwWsKLdvRFhipmLmWAqYhAv',
  },
  parameters: {
    docs: {
      source: {
        
        code: buildSourceCode(baseArgs),
      },
    },
  },
  render: (args) => {
    const style = 'display: block; width: 600px; height: 350px; border: 2px solid #666; border-radius: 8px; background: #f9f9f9; padding: 16px;';
    return createPerformance({ ...args, style });

  }
};
