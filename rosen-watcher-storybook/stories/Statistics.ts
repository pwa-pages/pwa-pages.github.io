import './statistics.css';

export const createStatistics = ({
  period,
  backgroundColor,
  chartTitle,
  chartColor,
  accentChartColor,
  address1,
  address2,
}) => {
  const rosenWatcherComponent = document.createElement('rosen-watcher-component');
  rosenWatcherComponent.setAttribute('component', 'statistics');
  rosenWatcherComponent.setAttribute('render-html', 'true');
  rosenWatcherComponent.setAttribute('address1', address1);
    rosenWatcherComponent.setAttribute('address2', address2);
  rosenWatcherComponent.setAttribute('period', period);
  rosenWatcherComponent.setAttribute('chart-title', chartTitle);
  rosenWatcherComponent.setAttribute('chart-color', chartColor);
  rosenWatcherComponent.setAttribute('accent-chart-color', accentChartColor);
  rosenWatcherComponent.setAttribute('style', 'border:1px solid black; width: 500px; height:300px; display: block;');



  rosenWatcherComponent.style.backgroundColor = backgroundColor;

  return rosenWatcherComponent;
};
