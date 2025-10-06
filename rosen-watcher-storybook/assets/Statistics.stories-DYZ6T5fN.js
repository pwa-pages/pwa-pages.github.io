/* empty css              */import{e as p}from"./index-1v6kQ9Nt.js";import{r as u,a as m}from"./iframe-DbRw1Gdk.js";import"./preload-helper-D9Z9MdNV.js";const r=({period:t,backgroundColor:a,chartTitle:s,chartColor:d,accentChartColor:c,address1:i,address2:h,style:l="border:1px solid black; width: 500px; height:300px; display: block;"})=>{const e=document.createElement("rosen-watcher-component");return e.setAttribute("component","statistics"),e.setAttribute("render-html","true"),e.setAttribute("address1",i),e.setAttribute("address2",h),e.setAttribute("period",t),e.setAttribute("chart-title",s),e.setAttribute("chart-color",d),e.setAttribute("accent-chart-color",c),e.setAttribute("style",l),e.style.backgroundColor=a,e},b=`<h3>Description</h3>

<p>The statistics component can be used to render HTML that shows the amount earned for a set of watchers over time,
similar to <a href="https://pwa-pages.github.io/rosen-watcher-pwa/load.html?page=statistics">https://pwa-pages.github.io/rosen-watcher-pwa/load.html?page=statistics</a>.<br/>
All data from that screen can also be retrieved by a DOM event in case
the intention is to design the HTML oneself. <br/>
In this way, all relevant data is exposed through a DOM event.
<br/><br/>
An example of usage of the component can be tried <a href="./?path=/story/components-statistics--primary">here</a>
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
    &lt;link rel=&quot;stylesheet&quot; href=&quot;__STYLE_FILE__&quot; /&gt;
    &lt;script src=&quot;__SCRIPT_FILE__&quot; type=&quot;module&quot;&gt;&lt;/script&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;rosen-watcher-component 
    component=&quot;statistics&quot; 
    render-html=&quot;true&quot; 
    address1=&quot;9gWWVhZX1nmzjaKqtmQMvE15gV3u8exUgaZHokwT2he9ru5B5NV&quot; 
    address2=&quot;9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38&quot; 
    period=&quot;All&quot; 
    chart-title=&quot;Lobster pool rewards&quot; 
    chart-color=&quot;#666666&quot; 
    accent-chart-color=&quot;#cccccc&quot;/&gt;

  &lt;/body&gt;
&lt;/html&gt;

&lt;script&gt;
      const watchersEl = document.querySelector('rosen-watcher-component');

      watchersEl.addEventListener('notifyStatisticsChartChanged', (event) =&gt; {
        console.log('Statistics changed:', JSON.stringify(event.detail));
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
      <td>Watcher address to show statistics for</td>
    </tr>
    <tr>
      <td><code>address2</code></td>
      <td>string</td>
      <td></td>
      <td>Watcher address to show statistics for</td>
    </tr>
    <tr>
      <td><code>addressX (up to 20 addresses, address3, address4 ... address20)</code></td>
      <td>string</td>
      <td></td>
      <td>Watcher address to show statistics for</td>
    </tr>
    <tr>
      <td><code>period</code></td>
      <td>string</td>
      <td></td>
      <td>One of: <br/><br/>Day<br/>Week<br/>Month<br/>Year<br/>All</td>
    </tr>
    <tr>
      <td><code>chart-title</code></td>
      <td>string</td>
      <td></td>
      <td>Title of the chart as shown in chart canvas</td>
    </tr>
    <tr>
      <td><code>chart-color</code></td>
      <td>string</td>
      <td></td>
      <td>HTML style color, shown for the graph in canvas</td>
    </tr>
    <tr>
      <td><code>accent-chart-color</code></td>
      <td>string</td>
      <td></td>
      <td>HTML style color, shown for the labels, borders, etc. in the canvas</td>
    </tr>
  </tbody>
</table>


<h3>Events</h3>

<h4><code>notifyStatisticsChartChanged</code></h4>

<p>Fired whenever the statistics update after incremental downloads are done. The component can send multiple events of type <code>notifyStatisticsChartChanged</code>
as it retrieves data incrementally and refreshes the data based on this,
so in the first few updates the data might still be incomplete,
but in the end after all updates the data is complete.
The component fires at least one event so users of the component can be sure that the data is available,
and won't have to store data themselves (of course they can do that if they want to).
</p>

<p><strong>JavaScript usage:</strong></p>

<pre><code>const watchersEl = document.querySelector('rosen-watcher-component');

      watchersEl.addEventListener('notifyStatisticsChartChanged', (event) => {
        console.log('Statistics changed:', JSON.stringify(event.detail));
      });
</code></pre>

<p>
The JSON sent back is shown below. The intention is not to introduce many breaking changes;
will try to remain backwards compatible as much as possible,
but it is advised when using newer versions to check if the JSON has changed,
and act accordingly.
The data in JSON are amounts earned on a given date,
the graph is showing accumulative but the events show amounts per date,
which can be accumulated by the components that use this event if needed.
</p>

<pre><code>

[
  {"x":"2025-08-20T20:00:02.279Z","y":2.207},
  {"x":"2025-08-20T21:11:13.992Z","y":2.207},
  {"x":"2025-08-20T22:35:54.445Z","y":1.983},
  {"x":"2025-08-20T22:35:54.445Z","y":1.983},
  {"x":"2025-08-21T00:32:04.086Z","y":1.858},
  {"x":"2025-08-21T00:37:20.927Z","y":1.858},
  {"x":"2025-08-21T04:28:43.652Z","y":1.898},
  {"x":"2025-08-21T04:28:43.652Z","y":1.898},
  {"x":"2025-08-21T05:00:07.922Z","y":11.291},
  {"x":"2025-08-21T05:00:07.922Z","y":2.207}
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
      <td><code>x</code></td>
      <td>string (date)</td>
      <td>Timestamp for the data point.</td>
    </tr>
    <tr>
      <td><code>y</code></td>
      <td>number</td>
      <td>Amount earned at the given timestamp.</td>
    </tr>
  </tbody>
</table>
`,o={address1:"9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38",address2:"",chartTitle:"Lobster pool rewards",chartColor:"#666666",accentChartColor:"#cccccc",period:"All"};var g=b.replace(/__SCRIPT_FILE__/g,u).replace(/__STYLE_FILE__/g,m);const _={title:"Components/Statistics",tags:["autodocs"],render:t=>r({...t}),argTypes:{backgroundColor:{control:"color"},accentChartColor:{control:"color"},chartColor:{control:"color"},address1:{control:"text"},address2:{control:"text"},period:{control:{type:"select"},options:["Day","Week","Month","Year","All"]}},args:o,parameters:{docs:{page:()=>p.createElement("div",{dangerouslySetInnerHTML:{__html:g}})}}};function y(t){return`

    <rosen-watcher-component
      style="display: block; width: 500px; height: 300px; float: left"
      component="statistics"
      address1="${t.address1||""}"
      address2="${t.address2||""}"
      render-html="true"
      chart-title="${t.chartTitle||""}"
      chart-color="${t.chartColor||""}"
      accent-chart-color="${t.accentChartColor||""}"
      period="${t.period||"Day"}">
      
    </rosen-watcher-component>

  `}const n={name:"Explore Component",args:{address1:"",address2:"9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38"},parameters:{docs:{source:{code:y(o)}}},render:t=>r({...t})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'Explore Component',
  args: {
    address1: "",
    address2: "9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38"
  },
  parameters: {
    docs: {
      source: {
        code: buildSourceCode(baseArgs)
      }
    }
  },
  render: args => {
    return createStatistics({
      ...args
    });
  }
}`,...n.parameters?.docs?.source}}};const v=["Primary"];export{n as Primary,v as __namedExportsOrder,_ as default};
