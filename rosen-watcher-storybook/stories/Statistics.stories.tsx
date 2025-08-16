import { createStatistics } from './Statistics';
import htmlContent from './statistics.html?raw';
import React from 'react';

const baseArgs = {
  address1: '9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38',
  address2: '',
  chartTitle: 'Lobster pool rewards',
  chartColor: '#666666',
  accentChartColor: '#cccccc',
  period: 'All',
};

export default {
  title: 'Example/Statistics',
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
        dangerouslySetInnerHTML={{ __html: htmlContent }}
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
    const style = 'display: block; width: 600px; height: 350px; border: 2px solid #666; border-radius: 8px; background: #f9f9f9; padding: 16px;';
    return createStatistics({ ...args, style });

  }
};
