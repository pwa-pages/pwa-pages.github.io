self.addEventListener('message', (event) => {

  console.log('Rosen service worker received event of type ' + event.data.type);

    if (event.data && event.data.type === 'START_TASK') {
      
  
      
      setTimeout(() => {
        console.log('Custom SW Extension: Task completed.');
  
      
        event.source.postMessage({
          type: 'TASK_COMPLETE',
          message: 'Background task completed from custom extension!',
        });
      }, 5000); 
    }
  });