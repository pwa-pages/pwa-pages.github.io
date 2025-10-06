
import './rosen.css';

export const createPermits = ({
    address1,
  address2,
  address3,
  address4,
}) => {
  const rosenWatcherComponent = document.createElement('rosen-watcher-component');
  rosenWatcherComponent.setAttribute('component', 'permits');
  rosenWatcherComponent.setAttribute('render-html', 'true');
  rosenWatcherComponent.setAttribute('address1', address1);
  rosenWatcherComponent.setAttribute('address2', address2);
  rosenWatcherComponent.setAttribute('address3', address3);
  rosenWatcherComponent.setAttribute('address4', address4);
  



  

  return rosenWatcherComponent;
};
