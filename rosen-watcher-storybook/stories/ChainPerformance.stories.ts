import { createChainPerformance } from './ChainPerformance';


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
