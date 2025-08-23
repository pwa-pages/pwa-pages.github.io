import { createStatistics } from './Statistics';
import htmlContent from './statistics.html?raw';
import React from 'react';
import { rosenScriptFile, rosenStyleFile } from '../.storybook/preview';

const baseArgs = {
  address1: '9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38',
  address2: '',
  chartTitle: 'Lobster pool rewards',
  chartColor: '#666666',
  accentChartColor: '#cccccc',
  period: 'All',
};

var content = htmlContent
          .replace(/__SCRIPT_FILE__/g, rosenScriptFile)
          .replace(/__STYLE_FILE__/g, rosenStyleFile);

export default {
  title: 'Components/Statistics',
  tags: ['autodocs'],
  render: (args) => {
    return createStatistics({ ...args });
  },
  argTypes: {
    backgroundColor: { control: 'color' },
    accentChartColor: { control: 'color' },
    chartColor: { control: 'color' },
    address1: { control: 'text' },
    address2: { control: 'text' },
    period: {
      control: { type: 'select' },
      options: ['Day', 'Week', 'Month', 'Year', 'All'],
    },
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
      component="statistics"
      address1="${args.address1 || ''}"
      address2="${args.address2 || ''}"
      render-html="true"
      chart-title="${args.chartTitle || ''}"
      chart-color="${args.chartColor || ''}"
      accent-chart-color="${args.accentChartColor || ''}"
      period="${args.period || 'Day'}">
      
    </rosen-watcher-component>

  `;
}

export const Primary = {
  name: 'Explore Component',
  args: {
    address1: "",
    address2: "9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38"
  },
  parameters: {
    docs: {
      source: {
        
        code: buildSourceCode(baseArgs),
      },
    },
  },
  render: (args) => {
    
    return createStatistics({ ...args });

  }
};
