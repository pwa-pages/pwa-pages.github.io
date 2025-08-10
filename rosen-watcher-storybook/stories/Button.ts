import './button.css';

export const createButton = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  onClick,
}) => {
  const rosenWatcherComponent = document.createElement('rosen-watcher-component');
  rosenWatcherComponent.setAttribute('component', 'statistics');
  rosenWatcherComponent.setAttribute('render-html', 'true');
  rosenWatcherComponent.setAttribute('address1', '9gWWVhZX1nmzjaKqtmQMvE15gV3u8exUgaZHokwT2he9ru5B5NV');
  rosenWatcherComponent.setAttribute('period', 'Month');
  rosenWatcherComponent.setAttribute('chart-title', 'Crab pool rewards last month');

  


  const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';
  rosenWatcherComponent.style.backgroundColor = backgroundColor;

  return rosenWatcherComponent;
};
