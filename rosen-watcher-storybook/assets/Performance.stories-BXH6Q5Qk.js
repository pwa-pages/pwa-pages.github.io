import{e as i}from"./index-1v6kQ9Nt.js";import{r as l,a as p}from"./iframe-D0IZQj6F.js";import"./preload-helper-D9Z9MdNV.js";const r=({backgroundColor:e,accentChartColor:a,address1:d,address2:s,address3:c,address4:h})=>{const t=document.createElement("rosen-watcher-component");return t.setAttribute("component","performance"),t.setAttribute("render-html","true"),t.setAttribute("address1",d),t.setAttribute("address2",s),t.setAttribute("address3",c),t.setAttribute("address4",h),t.setAttribute("accent-chart-color",a),t.setAttribute("style","border:1px solid black; width: 500px; height:300px; display: block;"),t.style.backgroundColor=e,t},m=`<h3>Description</h3>

<p>The performance component can be used to render HTML that shows the amount earned per week for a set of watchers over time,
similar to <a href="https://pwa-pages.github.io/rosen-watcher-pwa/load.html?page=performance">https://pwa-pages.github.io/rosen-watcher-pwa/load.html?page=performance</a>.
This component gives insight into how different addresses perform compared to each other per week.
<br/>
All data from that screen can also be retrieved by a DOM event in case
the intention is to design the HTML oneself. <br/>
In this way, all relevant data is exposed through a DOM event.
<br/><br/>
An example of usage of the component can be tried <a href="./?path=/story/components-performance--primary">here</a>
<br/><br/>

<h3>
Setup component in your HTML:
</h3>
<br/>
Include <a href="__SCRIPT_FILE__">__SCRIPT_FILE__</a> in HTML.
Include <a href="__STYLE_FILE__">__STYLE_FILE__</a> if you want to use the default CSS,
this file can be ignored if all CSS needs to be custom.<br/><br/>
Minimal example (component can have up to 20 addresses, but here we use only 2 for simplicity, numbers go address3 etc...).
Example with all HTML, CSS, and JS can be downloaded from <a href="rosen_components.zip">rosen_components.zip</a>
<pre><code>
&lt;html&gt;
  &lt;head&gt;
    &lt;link rel="stylesheet" href="styles-2KIPJFYC.css" media="all" onload="this.media='all'" /&gt;
    &lt;script src="rosen-watcher-components.3.48.9.js" type="module"&gt;&lt;/script&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;rosen-watcher-component
      component="performance"
      render-html="true"
      address1="9gWWVhZX1nmzjaKqtmQMvE15gV3u8exUgaZHokwT2he9ru5B5NV"
      address2="9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38"
      accent-chart-color="#666666"
      style="height: 300px; width: 500px"
    /&gt;
  &lt;/body&gt;
&lt;/html&gt;

&lt;script&gt;
  const watchersEl = document.querySelector('rosen-watcher-component');

  watchersEl.addEventListener('notifyPerformanceChartsChanged', (event) =&gt; {
    console.log('Performance changed:', JSON.stringify(event.detail));
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
      <td>boolean</td>
      <td>"true", "false"</td>
      <td>Enables or disables rendering of inner HTML content inside the component. Defaults to <code>"true"</code>.</td>
    </tr>
    <tr>
      <td><code>address1</code></td>
      <td>string</td>
      <td></td>
      <td>Watcher address to show performance for.</td>
    </tr>
    <tr>
      <td><code>address2</code></td>
      <td>string</td>
      <td></td>
      <td>Watcher address to show performance for.</td>
    </tr>
    <tr>
      <td><code>addressX (up to 20 addresses, address3, address4 ... address20)</code></td>
      <td>string</td>
      <td></td>
      <td>Watcher address to show performance for.</td>
    </tr>
    <tr>
      <td><code>accent-chart-color</code></td>
      <td>string</td>
      <td></td>
      <td>HTML style color, shown for the labels, borders, etc. in the canvas.</td>
    </tr>
  </tbody>
</table>


<h3>Events</h3>

<h4><code>notifyPerformanceChartsChanged</code></h4>

<p>Fired whenever the performance updates after incremental downloads are done. The component can send multiple events of type <code>notifyPerformanceChartsChanged</code>
as it retrieves data incrementally and refreshes the data based on this,
so in the first few updates the data might still be incomplete,
but in the end, after all updates, the data is complete.
The component fires at least one event so users of the component can be sure that the data is available,
and won't have to store data themselves (of course they can do that if they want to).
</p>

<p><strong>JavaScript usage:</strong></p>

<pre><code>const watchersEl = document.querySelector('rosen-watcher-component');

      watchersEl.addEventListener('notifyPerformanceChartsChanged', (event) => {
        console.log('Performance changed:', JSON.stringify(event.detail));
      });
</code></pre>

<p>
The JSON sent back is shown below. The intention is not to introduce many breaking changes,
will try to remain backwards compatible as much as possible,
but it is advised when using newer versions to check if the JSON has changes,
and act accordingly.
The data in JSON are accumulative amounts earned for a given date (per week)
similar to how it is shown in the HTML part of this component.
</p>

<pre><code>
[
  {
    "address": "9gWWVhZX1nmzjaKqtmQMvE15gV3u8exUgaZHokwT2he9ru5B5NV",
    "addressForDisplay": "9gWWVh...u5B5NV",
    "chart": [
      { "x": "2025-08-02T22:00:00.000Z", "y": 5.545 },
      { "x": "2025-08-09T22:00:00.000Z", "y": 55.512 },
      { "x": "2025-08-16T22:00:00.000Z", "y": 90.886 }
      // ...
    ],
    "chainType": "Cardano",
    "color": "#1f77b4"
  },
  {
    "address": "9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38",
    "addressForDisplay": "9f6pDd...TVRZ38",
    "chart": [
      { "x": "2025-02-15T23:00:00.000Z", "y": 1.075 },
      { "x": "2025-02-22T23:00:00.000Z", "y": 166.134 },
      { "x": "2025-03-01T23:00:00.000Z", "y": 203.388 },
      { "x": "2025-03-08T23:00:00.000Z", "y": 73.383 },
      { "x": "2025-03-15T23:00:00.000Z", "y": 13.512 },
      { "x": "2025-03-22T23:00:00.000Z", "y": 6.214 },
      { "x": "2025-03-29T23:00:00.000Z", "y": 7.945 },
      { "x": "2025-04-05T22:00:00.000Z", "y": 35.643 },
      { "x": "2025-04-12T22:00:00.000Z", "y": 32.392 },
      { "x": "2025-04-19T22:00:00.000Z", "y": 29.687 },
      // ...
    ],
    "chainType": "Ergo",
    "color": "#2ca02c"
  }
  // ...
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
      <td><code>address</code></td>
      <td>string</td>
      <td>Watcher address.</td>
    </tr>
    <tr>
      <td><code>addressForDisplay</code></td>
      <td>string</td>
      <td>Shortened address for display purposes.</td>
    </tr>
    <tr>
      <td><code>chart</code></td>
      <td>array of objects</td>
      <td>List of weekly earnings data points. Each object contains <code>x</code> (date) and <code>y</code> (amount earned).</td>
    </tr>
    <tr>
      <td><code>chainType</code></td>
      <td>string</td>
      <td>Blockchain type (e.g., Cardano, Ergo).</td>
    </tr>
    <tr>
      <td><code>color</code></td>
      <td>string</td>
      <td>Color used for chart representation if needed.</td>
    </tr>
  </tbody>
</table>`,o={address1:"9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38",address2:"9gnew46Ts9wZQWmbMWTebJE1yhqc1FAMXt3qQa8LjW3Uu7D4KnD",address3:"9ehyh2Ti9kBvnodWsafHhzT5557eTwWsKLdvRFhipmLmWAqYhAv",address4:"9htrN7JGgi8bxABJLCCskWqAHpatQqttFUF6GY68yaEbahG5Vx6",accentChartColor:"#666666"};var u=m.replace(/__SCRIPT_FILE__/g,l).replace(/__STYLE_FILE__/g,p);const T={title:"Components/Performance",tags:["autodocs"],render:e=>r({...e}),argTypes:{backgroundColor:{control:"color"},accentChartColor:{control:"color"},address1:{control:"text"},address2:{control:"text"},address3:{control:"text"},address4:{control:"text"}},args:o,parameters:{docs:{page:()=>i.createElement("div",{dangerouslySetInnerHTML:{__html:u}})}}};function g(e){return`

    <rosen-watcher-component
      style="display: block; width: 500px; height: 300px; float: left"
      component="performance"
      address1="${e.address1||""}"
      address2="${e.address2||""}"
      address3="${e.address3||""}"
      address4="${e.address4||""}"
      render-html="true"
      accent-chart-color="${e.accentChartColor||""}"      >
      
    </rosen-watcher-component>

  `}const n={name:"Explore Component",args:{address1:"9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38",address2:"9gnew46Ts9wZQWmbMWTebJE1yhqc1FAMXt3qQa8LjW3Uu7D4KnD",address3:"9ehyh2Ti9kBvnodWsafHhzT5557eTwWsKLdvRFhipmLmWAqYhAv",address4:"9htrN7JGgi8bxABJLCCskWqAHpatQqttFUF6GY68yaEbahG5Vx6"},parameters:{docs:{source:{code:g(o)}}},render:e=>r({...e})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'Explore Component',
  args: {
    address1: '9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38',
    address2: '9gnew46Ts9wZQWmbMWTebJE1yhqc1FAMXt3qQa8LjW3Uu7D4KnD',
    address3: '9ehyh2Ti9kBvnodWsafHhzT5557eTwWsKLdvRFhipmLmWAqYhAv',
    address4: '9htrN7JGgi8bxABJLCCskWqAHpatQqttFUF6GY68yaEbahG5Vx6'
  },
  parameters: {
    docs: {
      source: {
        code: buildSourceCode(baseArgs)
      }
    }
  },
  render: args => {
    const style = 'display: block; width: 600px; height: 350px; border: 2px solid #666; border-radius: 8px; background: #f9f9f9; padding: 16px;';
    return createPerformance({
      ...args,
      style
    });
  }
}`,...n.parameters?.docs?.source}}};const w=["Primary"];export{n as Primary,w as __namedExportsOrder,T as default};
