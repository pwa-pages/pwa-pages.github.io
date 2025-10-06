/* empty css              */import{e as r}from"./index-1v6kQ9Nt.js";import{r as o,a}from"./iframe-BvOc4_TI.js";import"./preload-helper-D9Z9MdNV.js";const d=({backgroundColor:t})=>{const n=document.createElement("rosen-watcher-component");return n.setAttribute("component","watchers"),n.setAttribute("render-html","true"),n.style.backgroundColor=t,n},c=`<h3>Description</h3>

<p>The watchers component can be used to render HTML with Rosen Bridge watcher stats,
similar to <a href="https://pwa-pages.github.io/rosen-watcher-pwa/watchers">https://pwa-pages.github.io/rosen-watcher-pwa/watchers</a>.<br/>
All data from that screen can also be retrieved by a DOM event in case
the intention is to design the HTML oneself. <br/>
In this way, all relevant data is exposed through a DOM event.
<br/><br/>
An example of usage of the component can be tried <a href="./?path=/story/components-watchers--primary">here</a>
<br/><br/>

<h3>
Setup component in your HTML:
</h3>
<br/>
Include <a href="__SCRIPT_FILE__">__SCRIPT_FILE__</a> in HTML.
Include <a href="__STYLE_FILE__">__STYLE_FILE__</a> if you want to use the default CSS;
this file can be ignored if all CSS needs to be custom.<br/><br/>
Minimal example (Example with all HTML, CSS, and JS can be downloaded from <a href="rosen_components.zip">rosen_components.zip</a>): 
<pre><code>
&lt;html&gt;
  &lt;head&gt;
    &lt;link rel=&quot;stylesheet&quot; href=&quot;__STYLE_FILE__&quot; /&gt;
    &lt;script src=&quot;__SCRIPT_FILE__&quot; type=&quot;module&quot;&gt;&lt;/script&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;rosen-watcher-component component=&quot;watchers&quot; render-html=&quot;true&quot;&gt; &lt;/rosen-watcher-component&gt;
  &lt;/body&gt;
&lt;/html&gt;

&lt;script&gt;
      const watchersEl = document.querySelector('rosen-watcher-component');

      watchersEl.addEventListener('notifyWatchersStatsChanged', (event) =&gt; {
        console.log('Watchers stats changed:', JSON.stringify(event.detail));
      });
&lt;/script&gt;

</code>
</pre>

</p>

<hr />

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

<p><strong>Example:</strong></p>

<pre><code>&lt;rosen-watcher-component component="watchers" render-html="true"&gt;&lt;/rosen-watcher-component&gt;</code></pre>

<hr />

<h3>Events</h3>

<h4><code>notifyWatchersStatsChanged</code></h4>

<p>Fired whenever the internal watcher statistics update. Watchers can send multiple events of type <code>notifyWatchersStatsChanged</code>
as it retrieves data from multiple sources and refreshes the data based on this,
so in the first few updates the data might still be incomplete,
but in the end, after all updates, the data is complete.
The component fires at least one event so users of the component can be sure that the data is available,
and won't have to store data themselves (of course, they can do that if they want to).
</p>

<p><strong>JavaScript usage:</strong></p>

<pre><code>const watchersEl = document.querySelector('rosen-watcher-component');

      watchersEl.addEventListener('notifyWatchersStatsChanged', (event) => {
        console.log('Watchers stats changed:', JSON.stringify(event.detail));
      });
</code></pre>

<p>
The JSON sent back is shown below. The intention is not to introduce many breaking changes;
will try to remain backwards compatible as much as possible,
but it is advised when using newer versions to check if the JSON has changed,
and act accordingly. 
</p>

<pre><code>


{
  "activePermitCount": {
    "Binance": 0,
    "Bitcoin": 0,
    "Cardano": 3,
    "Ergo": 5,
    "Ethereum": 0,
    "Doge": 0
  },
  "bulkPermitCount": {
    "Binance": 0,
    "Bitcoin": 0,
    "Cardano": 0,
    "Ergo": 0,
    "Ethereum": 0,
    "Doge": 0
  },
  "chainLockedERG": {
    "Binance": 20000,
    "Bitcoin": 21600,
    "Cardano": 70400,
    "Ergo": 87200,
    "Ethereum": 16800,
    "Doge": 16800
  },
  "chainLockedRSN": {
    "Binance": 1209000,
    "Bitcoin": 1308000,
    "Cardano": 4323000,
    "Ergo": 5844000,
    "Ethereum": 1035000,
    "Doge": 924000
  },
  "chainPermitCount": {
    "Binance": 153,
    "Bitcoin": 166,
    "Cardano": 561,
    "Ergo": 858,
    "Ethereum": 135,
    "Doge": 98
  },
  "chainWatcherCount": {
    "Binance": 25,
    "Bitcoin": 27,
    "Cardano": 88,
    "Ergo": 109,
    "Ethereum": 21,
    "Doge": 21
  },
  "permitCost": 3000,
  "triggerPermitCount": {
    "Cardano": 3,
    "Ergo": 5
  },
  "watcherCollateralERG": 800,
  "watcherCollateralRSN": 30000,
  "watchersAmountsPerCurrency": {
    "EUR": {
      "watcherValue": 1832.759,
      "permitValue": 114.35262,
      "rsnCollateral": 1143.5262,
      "ergCollateral": 689.2328,
      "totalLockedERG": 200566.7448,
      "totalLockedRSN": 783544.15224,
      "totalLocked": 984110.89704
    },
    "USD": {
      "watcherValue": 2143.8684,
      "permitValue": 133.74684,
      "rsnCollateral": 1337.4684,
      "ergCollateral": 806.4,
      "totalLockedERG": 234662.4,
      "totalLockedRSN": 916433.34768,
      "totalLocked": 1151095.74768
    },
    "ERG": {
      "watcherValue": 2127.303285624248,
      "permitValue": 132.73032856242477,
      "rsnCollateral": 1327.3032856242478,
      "ergCollateral": 800,
      "totalLockedERG": 232800,
      "totalLockedRSN": 909468.2113097346,
      "totalLocked": 1142268.2113097347
    },
    "RSN": {
      "watcherValue": 48081.77547659162,
      "permitValue": 3000,
      "rsnCollateral": 30000,
      "ergCollateral": 18081.775476591618,
      "totalLockedERG": 5261796.6636881605,
      "totalLockedRSN": 20556000,
      "totalLocked": 25817796.66368816
    }
  },
  "totalWatcherCount": 291,
  "totalPermitCount": 1971,
  "totalActivePermitCount": 8,
  "totalLockedRSN": 14643000,
  "totalLockedERG": 232800
}

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
      <td><code>activePermitCount</code></td>
      <td>number</td>
      <td>Number of active permits per chain.</td>
    </tr>
    <tr>
      <td><code>bulkPermitCount</code></td>
      <td>number</td>
      <td>Bulk permit counts per chain (used internally by Angular app, this is probably not needed by callers of this component; it is there for completeness).</td>
    </tr>
    <tr>
      <td><code>chainLockedERG</code></td>
      <td>number</td>
      <td>Total ERG locked per chain.</td>
    </tr>
    <tr>
      <td><code>chainLockedRSN</code></td>
      <td>number</td>
      <td>Total RSN locked per chain.</td>
    </tr>
    <tr>
      <td><code>chainPermitCount</code></td>
      <td>number</td>
      <td>Total number of permits per chain.</td>
    </tr>
    <tr>
      <td><code>chainWatcherCount</code></td>
      <td>number</td>
      <td>Total number of watchers per chain.</td>
    </tr>
    <tr>
      <td><code>permitCost</code></td>
      <td>number</td>
      <td>Cost of a permit (in RSN).</td>
    </tr>
    <tr>
      <td><code>triggerPermitCount</code></td>
      <td>number</td>
      <td>Trigger permit counts per chain (used internally by Angular app, this is probably not needed by callers of this component; it is there for completeness).</td>
    </tr>
    <tr>
      <td><code>watcherCollateralERG</code></td>
      <td>number</td>
      <td>Collateral required per watcher in ERG.</td>
    </tr>
    <tr>
      <td><code>watcherCollateralRSN</code></td>
      <td>number</td>
      <td>Collateral required per watcher in RSN.</td>
    </tr>
    <tr>
      <td><code>watchersAmountsPerCurrency</code></td>
      <td>object</td>
      <td>
        Aggregated watcher and permit values, collateral, and locked amounts per currency (EUR, USD, ERG, RSN).<br/>
        <strong>Fields per currency:</strong>
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
              <td><code>watcherValue</code></td>
              <td>number</td>
              <td>Total value of all watchers in the given currency.</td>
            </tr>
            <tr>
              <td><code>permitValue</code></td>
              <td>number</td>
              <td>Total value of all permits in the given currency.</td>
            </tr>
            <tr>
              <td><code>rsnCollateral</code></td>
              <td>number</td>
              <td>Total RSN collateral value in the given currency.</td>
            </tr>
            <tr>
              <td><code>ergCollateral</code></td>
              <td>number</td>
              <td>Total ERG collateral value in the given currency.</td>
            </tr>
            <tr>
              <td><code>totalLockedERG</code></td>
              <td>number</td>
              <td>Total ERG locked in the given currency.</td>
            </tr>
            <tr>
              <td><code>totalLockedRSN</code></td>
              <td>number</td>
              <td>Total RSN locked in the given currency.</td>
            </tr>
            <tr>
              <td><code>totalLocked</code></td>
              <td>number</td>
              <td>Total value locked (ERG + RSN) in the given currency.</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td><code>totalWatcherCount</code></td>
      <td>number</td>
      <td>Total number of watchers across all chains.</td>
    </tr>
    <tr><h2 id="chain-performance"> <code>Chain performance</code></h2>

      <td><code>totalPermitCount</code></td>
      <td>number</td>
      <td>Total number of permits across all chains.</td>
    </tr>
    <tr>
      <td><code>totalActivePermitCount</code></td>
      <td>number</td>
      <td>Total number of active permits across all chains.</td>
    </tr>
    <tr>
      <td><code>totalLockedRSN</code></td>
      <td>number</td>
      <td>Total RSN locked across all chains.</td>
    </tr>
    <tr>
      <td><code>totalLockedERG</code></td>
      <td>number</td>
      <td>Total ERG locked across all chains.</td>
    </tr>
  </tbody>
</table>

<hr />
`,l={};var s=c.replace(/__SCRIPT_FILE__/g,o).replace(/__STYLE_FILE__/g,a);const g={title:"Components/Watchers",tags:["autodocs"],render:t=>d({...t}),argTypes:{backgroundColor:{control:"color"}},args:l,parameters:{docs:{page:()=>r.createElement("div",{dangerouslySetInnerHTML:{__html:s}})}}};function i(t){return`

    <rosen-watcher-component

      component="watchers"
      render-html="true"
      >
      
    </rosen-watcher-component>

  `}const e={args:{},name:"Explore Component",parameters:{docs:{source:{code:i()}}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {},
  name: 'Explore Component',
  parameters: {
    docs: {
      source: {
        code: buildSourceCode(baseArgs)
      }
    }
  }
}`,...e.parameters?.docs?.source}}};const b=["Primary"];export{e as Primary,b as __namedExportsOrder,g as default};
