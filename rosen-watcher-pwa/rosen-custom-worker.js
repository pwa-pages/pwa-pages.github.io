self.addEventListener('message', (event) => {

  console.log('Rosen service worker received event of type ' + event.data.type);

    if (event.data && event.data.type === 'StatisticsScreenLoaded') {
      console.log('Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain');


      setTimeout(() => {
        console.log('Rosen simulation task completed.');
  
      /*
        event.source.postMessage({
          type: 'EndDownload',
          message: 'Background task completed from custom extension!',
        });
*/

      }, 10000); 
      
    }
  });