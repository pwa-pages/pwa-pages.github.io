

export const createPerformance= ({

  backgroundColor,
  accentChartColor,
  address1,
  address2,
  address3,
  address4,
}) => {
  const rosenWatcherComponent = document.createElement('rosen-watcher-component');
  rosenWatcherComponent.setAttribute('component', 'performance');
  rosenWatcherComponent.setAttribute('render-html', 'true');
  rosenWatcherComponent.setAttribute('address1', address1);
  rosenWatcherComponent.setAttribute('address2', address2);
  rosenWatcherComponent.setAttribute('address3', address3);
  rosenWatcherComponent.setAttribute('address4', address4);
  rosenWatcherComponent.setAttribute('accent-chart-color', accentChartColor);
  rosenWatcherComponent.setAttribute('style', 'border:1px solid black; width: 500px; height:300px; display: block;');



  rosenWatcherComponent.style.backgroundColor = backgroundColor;

  return rosenWatcherComponent;
};
