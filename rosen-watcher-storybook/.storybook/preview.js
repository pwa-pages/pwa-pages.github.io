
document.body.insertAdjacentHTML('beforeend', '<rosen-watcher-component></rosen-watcher-component>');

const script = document.createElement('script');
script.src = './rosen-watcher-components.3.48.9.js'; 
script.type = 'module';    
script.async = false;
document.body.appendChild(script);

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = './styles-2KIPJFYC.css'; 
document.head.appendChild(link);

export const parameters = {
options: {
    storySort: {
      method: 'alphabetical',
    },
    initialStory: 'Overview--Primary'
}
}

export const rosenScriptFile = script.src;
export const rosenStyleFile = link.href;


