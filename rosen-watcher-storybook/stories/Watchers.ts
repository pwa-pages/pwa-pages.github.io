
import './rosen.css';

export const createWatchers = ({
  backgroundColor
}) => {
  const rosenWatcherComponent = document.createElement('rosen-watcher-component');
  rosenWatcherComponent.setAttribute('component', 'watchers');
  rosenWatcherComponent.setAttribute('render-html', 'true');




  rosenWatcherComponent.style.backgroundColor = backgroundColor;

  return rosenWatcherComponent;
};
