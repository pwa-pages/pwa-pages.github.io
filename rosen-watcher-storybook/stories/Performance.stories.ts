import { createPerformance } from './Performance';


const baseArgs = {
  address1: '9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38',
  address2: '',
  accentChartColor: '#666666'
};

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
    address2: { control: 'text' }
  },
  
  args: baseArgs,
};

function buildSourceCode(args) {
  return `

    <rosen-watcher-component
      style="display: block; width: 500px; height: 300px; float: left"
      component="performance"
      address1="${args.address1 || ''}"
      address2="${args.address2 || ''}"
      render-html="true"
      accent-chart-color="${args.accentChartColor || ''}">
      
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
