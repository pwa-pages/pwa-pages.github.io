/* empty css              */import{e as o}from"./index-1v6kQ9Nt.js";import{r as i,a as c}from"./iframe-CNz2AUap.js";import"./preload-helper-D9Z9MdNV.js";const h=({address1:e,address2:s,address3:d,address4:a})=>{const t=document.createElement("rosen-watcher-component");return t.setAttribute("component","permits"),t.setAttribute("render-html","true"),t.setAttribute("address1",e),t.setAttribute("address2",s),t.setAttribute("address3",d),t.setAttribute("address4",a),t},l=`<h3>Description</h3>

<p>The permits component can be used to render HTML with Rosen Bridge permits stats,
similar to <a href="https://pwa-pages.github.io/rosen-watcher-pwa/mywatchers">https://pwa-pages.github.io/rosen-watcher-pwa/mywatchers</a>.<br/>
All data from that screen can also be retrieved by a DOM event in case
the intention is to design the HTML oneself. <br/>
In this way, all relevant data is exposed through a DOM event.
<br/><br/>
An example of usage of the component can be tried <a href="./?path=/story/components-permits--primary">here</a>
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
    &lt;rosen-watcher-component 
      component=&quot;permits&quot; 
      render-html=&quot;true&quot;
      address1="9gWWVhZX1nmzjaKqtmQMvE15gV3u8exUgaZHokwT2he9ru5B5NV"
      address2="9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38"
    &gt; &lt;/rosen-watcher-component&gt;
    &lt;!-- always close with full tag xhtml way, otherwise custom components can give issues--&gt;
  &lt;/body&gt;
&lt;/html&gt;

&lt;script&gt;
      const watchersEl = document.querySelector('rosen-watcher-component');

      watchersEl.addEventListener('notifyPermitsStatsChanged', (event) =&gt; {
        console.log('Permits stats changed:', JSON.stringify(event.detail));
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
    <tr>
      <td><code>address1</code></td>
      <td>string</td>
      <td></td>
      <td>Watcher address to show permits for.</td>
    </tr>
    <tr>
      <td><code>address2</code></td>
      <td>string</td>
      <td></td>
      <td>Watcher address to show permits for.</td>
    </tr>
    <tr>
      <td><code>addressX (up to 20 addresses, address3, address4 ... address20)</code></td>
      <td>string</td>
      <td></td>
      <td>Watcher address to show permits for.</td>
    </tr>
  </tbody>
</table>

<hr />

<h3>Events</h3>

<h4><code>notifyPermitsStatsChanged</code></h4>

<p>Fired whenever the internal permits statistics update. Watchers can send multiple events of type <code>notifyPermitsStatsChanged</code>
as it retrieves data from multiple sources and refreshes the data based on this,
so in the first few updates the data might still be incomplete,
but in the end, after all updates, the data is complete.
The component fires at least one event so users of the component can be sure that the data is available,
and won't have to store data themselves (of course, they can do that if they want to).
</p>

<p><strong>JavaScript usage:</strong></p>

<pre><code>const watchersEl = document.querySelector('rosen-watcher-component');

      watchersEl.addEventListener('notifyPermitsStatsChanged', (event) => {
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


[
  {
    "key": "0",
    "activePermitCount": 0,
    "permitCount": 8,
    "wid": "6015f62700f812c2c79249ad2bfa3f378ad443fdf925666cbd02fdad481ff0a7",
    "chainType": "Ergo",
    "address": {
      "active": true,
      "address": "9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38",
      "smallAddressForDisplay": "9f6pDd...",
      "largeAddressForDisplay": "9f6pDd...TVRZ38",
      "chainType": "Ergo"
    }
  },
  {
    "key": "1",
    "activePermitCount": 0,
    "permitCount": 6,
    "wid": "941a907f847a0a87e9acc97ee9401a92ddd754487a5f475e92abf5dcbf4f1b8f",
    "chainType":
      "active": true,
      "address": "9gWWVhZX1nmzjaKqtmQMvE15gV3u8exUgaZHokwT2he9ru5B5NV",
      "smallAddressForDisplay": "9gWWVh...",
      "largeAddressForDisplay": "9gWWVh...u5B5NV",
      "chainType": "Cardano"
    }
  },
  {
    "key": "2",
    "activePermitCount": 0,
    "permitCount": 5,
    "wid": "b13942af14938d71b35f46a743b20bf670157ecf939d724d08c35c230a0a6195",
    "chainType": "Bitcoin",
    "address": {
      "address": "9hSCGaUdvLfz7LS5xrwPGqaJhpHHMXrMRqoMX9ntUugjXAgbELc",
      "smallAddressForDisplay": "9hSCGa...",
      "largeAddressForDisplay": "9hSCGa...AgbELc",
      "chainType": "Bitcoin"
    }
  },
  {
    "key": "3",
    "activePermitCount": 0,
    "permitCount": 23,
    "wid": "e8e21b614376cf31a07755aab5aeeee1948b75beab968fbf4d9595790644443a",
    "chainType": "Ethereum",
    "address": {
      "address": "9hfbeeHNkgsGFXpu86r3KfP1fDdVFeJZvMRt9QTri6ixyQYc1fG",
      "smallAddressForDisplay": "9hfbee...",
      "largeAddressForDisplay": "9hfbee...QYc1fG",
      "chainType": "Ethereum"
    }
  },
  {
    "key": "4",
    "activePermitCount": 0,
    "permitCount": 5,
    "wid": "b94122c744ed9a7479f462e40d2cc11d5ceeae3e8515e875bbd00fe11ec9aae0",
    "chainType": "Binance",
    "address": {
      "address": "9gnew46Ts9wZQWmbMWTebJE1yhqc1FAMXt3qQa8LjW3Uu7D4KnD",
      "smallAddressForDisplay": "9gnew4...",
      "largeAddressForDisplay": "9gnew4...7D4KnD",
      "chainType": "Binance"
    }
  },
  {
    "key": "5",
    "activePermitCount": 0,
    "permitCount": 5,
    "wid": "ebbf5281d086c001b207c34ac2765b974ad343a8e9fe1f7eac174a98ddd7207d",
    "chainType": "Doge",
    "address": {
      "address": "9gfq8fd4qkGuGh6t2Z22McguhDA9Af3hiUTQvRWoxc6BiHvoqSU",
      "smallAddressForDisplay": "9gfq8f...",
      "largeAddressForDisplay": "9gfq8f...HvoqSU",
      "chainType": "Doge"
    }
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
      <td><code>key</code></td>
      <td>string</td>
      <td>Index of the address in the array.</td>
    </tr>
    <tr>
      <td><code>activePermitCount</code></td>
      <td>number</td>
      <td>Number of active permits for the address.</td>
    </tr>
    <tr>
      <td><code>permitCount</code></td>
      <td>number</td>
      <td>Total number of permits for the address.</td>
    </tr>
    <tr>
      <td><code>wid</code></td>
      <td>string</td>
      <td>Watcher ID for the address.</td>
    </tr>
    <tr>
      <td><code>chainType</code></td>
      <td>string</td>
      <td>Blockchain type (e.g., Ergo, Cardano, Bitcoin, Ethereum, Binance, Doge).</td>
    </tr>
    <tr>
      <td><code>address</code></td>
      <td>object</td>
      <td>
        Address details object:
        <ul>
          <li><code>address</code> (string): Full address.</li>
          <li><code>smallAddressForDisplay</code> (string): Shortened address for display.</li>
          <li><code>largeAddressForDisplay</code> (string): Longer shortened address for display.</li>
          <li><code>chainType</code> (string): Blockchain type.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<hr />
`,r={address1:"9gFFEZPoDUAA1jgfoNMN5FMARPUbuRHGB8sS8i6Lm1M9dXAiVx9",address2:"9gyECosVSywUjXPLXAFo8uGKvdUrUGtCzs7ihWPCWaC7HkLvfSd",address3:"9fTbZHMsuBeWYAWsw7Nr61zNSe4i2FLrREhJcFGRkKLmNYVFwqL",address4:"9gSNSXxyDVcn9u7LheeEH4fibbRN3gGycnzbKAYhQ2JKyEEmLVS"};var p=l.replace(/__SCRIPT_FILE__/g,i).replace(/__STYLE_FILE__/g,c);const y={title:"Components/Permits",tags:["autodocs"],render:e=>h({...e}),argTypes:{address1:{control:"text"},address2:{control:"text"},address3:{control:"text"},address4:{control:"text"}},args:r,parameters:{docs:{page:()=>o.createElement("div",{dangerouslySetInnerHTML:{__html:p}})}}};function m(e){return`

    <rosen-watcher-component

      component="permits"
      render-html="true"
      address1="${e.address1||""}"
      address2="${e.address2||""}"
      address3="${e.address3||""}"
      address4="${e.address4||""}"
      >
      
    </rosen-watcher-component>

  `}const n={args:{address1:"9gFFEZPoDUAA1jgfoNMN5FMARPUbuRHGB8sS8i6Lm1M9dXAiVx9",address2:"9gyECosVSywUjXPLXAFo8uGKvdUrUGtCzs7ihWPCWaC7HkLvfSd",address3:"9fTbZHMsuBeWYAWsw7Nr61zNSe4i2FLrREhJcFGRkKLmNYVFwqL",address4:"9gSNSXxyDVcn9u7LheeEH4fibbRN3gGycnzbKAYhQ2JKyEEmLVS"},name:"Explore Component",parameters:{docs:{source:{code:m(r)}}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    address1: '9gFFEZPoDUAA1jgfoNMN5FMARPUbuRHGB8sS8i6Lm1M9dXAiVx9',
    address2: '9gyECosVSywUjXPLXAFo8uGKvdUrUGtCzs7ihWPCWaC7HkLvfSd',
    address3: '9fTbZHMsuBeWYAWsw7Nr61zNSe4i2FLrREhJcFGRkKLmNYVFwqL',
    address4: '9gSNSXxyDVcn9u7LheeEH4fibbRN3gGycnzbKAYhQ2JKyEEmLVS'
  },
  name: 'Explore Component',
  parameters: {
    docs: {
      source: {
        code: buildSourceCode(baseArgs)
      }
    }
  }
}`,...n.parameters?.docs?.source}}};const S=["Primary"];export{n as Primary,S as __namedExportsOrder,y as default};
