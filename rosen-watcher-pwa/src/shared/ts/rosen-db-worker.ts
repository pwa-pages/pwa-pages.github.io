self.addEventListener('message', async (event: MessageEvent) => {
  const data: MessageEvent = event.data;

  console.log(`Rosen service worker received event of type ${data.type}`);
});
