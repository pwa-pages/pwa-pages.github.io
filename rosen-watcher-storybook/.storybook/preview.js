
document.body.insertAdjacentHTML('beforeend', '<rosen-watcher-component></rosen-watcher-component>');

const script = document.createElement('script');
script.src = './rosen-watcher-components.3.50.0.js'; 
script.type = 'module';    
script.async = false;
document.body.appendChild(script);

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = './styles-M3OYNZ6D.css'; 
document.head.appendChild(link);

export const parameters = {
options: {
    storySort: {
       order: ['Overview', '*']
    },
    initialStory: 'Overview--Primary'
}
}

export const rosenScriptFile = script.src;
export const rosenStyleFile = link.href;


