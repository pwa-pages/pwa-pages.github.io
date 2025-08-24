/* empty css              */import{e as r}from"./index-1v6kQ9Nt.js";import{r as a,a as o}from"./iframe-D0IZQj6F.js";import"./preload-helper-D9Z9MdNV.js";const c=({backgroundColor:n})=>{const e=document.createElement("rosen-watcher-component");return e.setAttribute("component","chain-performance"),e.setAttribute("render-html","true"),e.setAttribute("style","border:1px solid black; width: 500px; height:300px; display: block;"),e.style.backgroundColor=n,e},s=`<h3>Description</h3>

<p>The chain-performance component can be used to render HTML with Rosen Bridge chain performance comparison
similar to <a href="https://pwa-pages.github.io/rosen-watcher-pwa/load.html?page=chainperformance">https://pwa-pages.github.io/rosen-watcher-pwa/load.html?page=chainperformance</a>.<br/>
All data from that screen can also be retrieved by a DOM event in case
the intention is to design the HTML oneself. <br/>
In this way all relevant data is exposed through a DOM event.
<br/><br/>
An example of usage of the component can be tried <a href = "./?path=/story/components-chainperformance--primary">here</a>
<br/><br/>

<h3>
Setup component in your HTML:
</h3>
<br/>
Include <a href = "__SCRIPT_FILE__">__SCRIPT_FILE__</a> in HTML.
Include <a href = "__STYLE_FILE__">__STYLE_FILE__</a> if you want to use the default CSS, 
this file can be ignored if all CSS needs to be custom.<br/><br/>
Minimal example (Example with all HTML, CSS, and JS can be downloaded from <a href = "rosen_components.zip">rosen_components.zip</a>): 
<pre><code>
&lt;html&gt;
  &lt;head&gt;
    &lt;link rel="stylesheet" href="styles-2KIPJFYC.css" media="all" onload="this.media='all'" /&gt;
    &lt;script src="rosen-watcher-components.3.48.9.js" type="module"&gt;&lt;/script&gt;
  &lt;/head&gt;

  &lt;body&gt;
    &lt;rosen-watcher-component
      style="display: block; width: 500px; height: 300px"
      component="chain-performance"
      render-html="true"
    /&gt;
  &lt;/body&gt;
&lt;/html&gt;

&lt;script&gt;
  const watchersEl = document.querySelector('rosen-watcher-component');

  watchersEl.addEventListener('notifyChainPerformanceChartsChanged', (event) =&gt; {
    console.log('Chain performance charts changed:', JSON.stringify(event.detail));
  });
&lt;/script&gt;

</code>
</pre>

</p>


<h3>Attributes</h3>

<table>
  <thead>
    <tr>
      <th>Attribute</th>
      <th>Type</th>
      <th>Values</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>render-html</code></td>
      <td>Boolean</td>
      <td>"true", "false"</td>
      <td>Enables or disables rendering of inner HTML content inside the component. Defaults to <code>"true"</code>.</td>
    </tr>
  </tbody>
</table>

<h3>Events</h3>

<h4><code>notifyChainPerformanceChartsChanged</code></h4>

<p>Fired whenever the internal chain performance data updates, the component can send multiple events of type notifyChainPerformanceChartsChanged
as it retrieves data incrementally and refreshes the data based on this,
so in the first few updates the data might still be incomplete,
but in the end after all updates the data is complete.
The component fires at least one event so users of the component can be sure that the data is available,
and won't have to store data themselves (of course they can do that if they want to).
</p>

<p><strong>JavaScript usage:</strong></p>

<pre><code>const watchersEl = document.querySelector('rosen-watcher-component');

      watchersEl.addEventListener('notifyChainPerformanceChartsChanged', (event) => {
        console.log('Chain performance charts changed:', JSON.stringify(event.detail));
      });
</code></pre>

<p>
The JSON sent back is shown below. The intention is not to introduce many breaking changes,
will try to remain backwards compatible as much as possible,
but it is advised when using newer versions to check if the JSON has changed,
and act accordingly. 
</p>

<pre><code>

[
  {
    "chainType": "Bitcoin",
    "chart": 0
  },
  {
    "chainType": "Cardano",
    "chart": 2160.9759999999987
  },
  {
    "chainType": "Ergo",
    "chart": 6442.441
  },
  {
    "chainType": "Ethereum",
    "chart": 0
  },
  {
    "chainType": "Binance",
    "chart": 0
  },
  {
    "chainType": "Doge",
    "chart": 0
  }
]

</code></pre>

<h3>JSON Fields Explanation</h3>

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>chainType</code></td>
      <td>string</td>
      <td>Chain type. Note new versions of the component might return more chain types.</td>
    </tr>
    <tr>
      <td><code>chart</code></td>
      <td>number</td>
      <td>Amount of rewards earned for a watcher for chain type in last week in RSN.</td>
    </tr>
  </tbody>
</table>
`,h={};var i=s.replace(/__SCRIPT_FILE__/g,a).replace(/__STYLE_FILE__/g,o);const g={title:"Components/ChainPerformance",tags:["autodocs"],render:n=>c({...n}),argTypes:{backgroundColor:{control:"color"}},args:h,parameters:{docs:{page:()=>r.createElement("div",{dangerouslySetInnerHTML:{__html:i}})}}};function d(n){return`

    <rosen-watcher-component

      component="chain-performance"
      render-html="true"
      >
      
    </rosen-watcher-component>

  `}const t={name:"Explore Component",args:{},parameters:{docs:{source:{code:d()}}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: 'Explore Component',
  args: {},
  parameters: {
    docs: {
      source: {
        code: buildSourceCode(baseArgs)
      }
    }
  }
}`,...t.parameters?.docs?.source}}};const f=["Primary"];export{t as Primary,f as __namedExportsOrder,g as default};
