
const script = document.createElement('script');
script.src = '/{{rosen.js}}'; 
script.type = 'module';    
script.async = true;
document.body.appendChild(script);

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/{{styles.css}}'; 
document.head.appendChild(link);

export const parameters = {};
