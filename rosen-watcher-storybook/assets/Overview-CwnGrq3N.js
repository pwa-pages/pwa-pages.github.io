import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{useMDXComponents as o}from"./index-B1lR4FZz.js";import"./index-1v6kQ9Nt.js";function s(t){const n={p:"p",...o(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx("h1",{children:"Rosen Watcher Component Library"}),`
`,e.jsx("br",{}),`
`,e.jsx("br",{}),`
`,e.jsx("p",{children:e.jsx(n.p,{children:`This documentation describes Rosen Watcher components that can be used in any HTML page.
The components show data related to watchers participating in Rosen Bridge on the Ergo blockchain,
like showing the number of active watchers, and mainly how much revenue watchers have made.
Within this site, the components are described, can be tried out, and the latest version of
the JavaScript / CSS files can be downloaded from samples.
Use the menu on the left to see documentation for the different components and try them out.`})}),`
`,e.jsx("hr",{}),`
`,e.jsx("p",{children:"Some general remarks about the components and this documentation:"}),`
`,e.jsxs("ul",{children:[e.jsx("li",{children:e.jsxs(n.p,{children:[`Components are HTML
`,e.jsx("a",{href:"https://html.spec.whatwg.org/multipage/custom-elements.html",children:"custom elements."}),`
Using the samples on this site, the properties of the HTML component can be adjusted to see the effect.`]})}),e.jsx("li",{children:e.jsx(n.p,{children:`Components are self-contained and will store data in browser database and sync on each visit.
This way, the site using the components does not need to store or maintain anything.
The components provide events though, if the site using them is interested in the data.`})}),e.jsx("li",{children:e.jsxs(n.p,{children:[`The latest version of the components can be downloaded from this site; the JavaScript has the version in the file name.
Newer versions will try to be backwards compatible as much as possible, as the components store data in the browser's cache.
The components are available from
`,e.jsx("a",{href:"rosen_components.zip",children:"rosen_components.zip"}),`, which contains all the necessary code + HTML minimal samples.
The samples can be used as a startup structure when integrating it into your site.`]})}),e.jsx("li",{children:e.jsx(n.p,{children:`The components can render HTML that will show the data tabularly or in graphs.
There is a default CSS available, but it can also be custom styled.
The components will fire events that provide data to be used.
If only events are needed, the components can be used without HTML, there is a property to render / not render html.`})}),e.jsx("li",{children:e.jsx(n.p,{children:`Changes to the properties of the components will automatically be picked up,
and the component will rerender based on the new properties.
This way, the components can be used dynamically.`})}),e.jsx("li",{children:e.jsx(n.p,{children:`Multiple components can be used on one page. For example, if someone wants to show
graphs for multiple watcher addresses separately on one page, multiple components can be set up.`})}),e.jsx("li",{children:e.jsx(n.p,{children:`The components use blockchain data from Ergo Explorer API,
and try to be economical in using this.
Please also do this so as not to create unnecessary traffic.`})})]})]})}function h(t={}){const{wrapper:n}={...o(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s(t)}export{h as default};
