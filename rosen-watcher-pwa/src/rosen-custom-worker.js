self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'START_TASK') {
      console.log('Custom SW Extension: START_TASK message received.');
  
      
      setTimeout(() => {
        console.log('Custom SW Extension: Task completed.');
  
      
        event.source.postMessage({
          type: 'TASK_COMPLETE',
          message: 'Background task completed from custom extension!',
        });
      }, 5000); 
    }
  });