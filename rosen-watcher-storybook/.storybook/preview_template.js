
document.body.insertAdjacentHTML('beforeend', '<rosen-watcher-component></rosen-watcher-component>');

const script = document.createElement('script');
script.src = '/{{rosen.js}}'; 
script.type = 'module';    
script.async = false;
document.body.appendChild(script);

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/{{styles.css}}'; 
document.head.appendChild(link);

export const parameters = {};



