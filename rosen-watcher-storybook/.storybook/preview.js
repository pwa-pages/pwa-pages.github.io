
const script = document.createElement('script');
script.src = '/rosen-watcher-components.3.47.6.js'; 
script.type = 'module';    
script.async = true;
document.body.appendChild(script);

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/styles.css'; 
document.head.appendChild(link);

export const parameters = {};
