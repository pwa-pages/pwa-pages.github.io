

export const createChainPerformance = ({
  backgroundColor
}) => {
  const rosenWatcherComponent = document.createElement('rosen-watcher-component');
  rosenWatcherComponent.setAttribute('component', 'chain-performance');
  rosenWatcherComponent.setAttribute('render-html', 'true');
  rosenWatcherComponent.setAttribute('style', 'border:1px solid black; width: 500px; height:300px; display: block;');



  rosenWatcherComponent.style.backgroundColor = backgroundColor;

  return rosenWatcherComponent;
};
