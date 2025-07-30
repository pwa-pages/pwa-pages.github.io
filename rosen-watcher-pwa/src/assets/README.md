<h1>🔧 Rosen watcher Web Component Library</h1>


<p>This project contains a growing collection of reusable, standalone web components built with <strong>Angular Elements</strong>. These components are framework-agnostic and work in any HTML/JavaScript environment — no Angular required in the host app.
</p>

<p>The components are based on functionality from rosen watchers pwa app: https://pwa-pages.github.io/rosen-watcher-pwa/.
Some people showed interest in using this functionality on their site,
having this exposed as a javascript component seems to be an easy way of integrating.
If there are issues pls send them to https://t.me/rosenbridge_erg to @Pebblerye.
</p>


<hr />

<h2>📦 Available Components</h2>

<table>
  <thead>
    <tr>
      <th>Component</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="#watchers"><code>watchers</code></a></td>
      <td>Displays watcher stats or retrieve watcher stats from dom events</td>
    </tr>
    <tr>
      <td><a href="#chain-performance"><code>chain-performance</code></a></td>
      <td>Show avarage performance over all watchers per chain</td>
    </tr>
  </tbody>
</table>

<hr />

<h2 id="watchers">📺 <code>watchers</code></h2>

<h3>Description</h3>

<p>The <code>watchers</code> component can be used to render html with rosen bridge watcher stats
similar to https://pwa-pages.github.io/rosen-watcher-pwa/watchers.<br/>
All data from that screen can also be retrieved by a dom event in case
the intention is to design the html oneself. <br/>
In this way all relevant data is exposed through a dom event.
<br/><br/>
An example(and the place to download the needed javascripts) of usage of the component with the latest versions can be found at:
<br/><br/>
<a href = "https://pwa-pages.github.io/rosen-watcher-pwa/web-component/rosen-watchers.html">https://pwa-pages.github.io/rosen-watcher-pwa/web-component/rosen-watchers.html</a> This file always contains the latest javascript versions with the latest build.
A css is added to that page and can be used to build on, but it can be ignored if all css needs to be custom.
<br/><br/>
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

<pre><code>&lt;rosen-watcher-component component="watchers" render-html="true"&lt;/rosen-watcher-component&gt;</code></pre>

<hr />

<h3>Events</h3>

<h4><code>notifyWatchersStatsChanged</code></h4>

<p>Fired whenever the internal watcher statistics update, watchers can send multiple events of type notifyWatchersStatsChanged
as it retrieves data from multiple sources and refreshes the data based on this,
so in the few first updates the data might still be incomplete,
but in the end after all updates the data is complete.
</p>

<p><strong>JavaScript usage:</strong></p>

<pre><code>const watchersEl = document.querySelector('rosen-watcher-component');

      watchersEl.addEventListener('notifyWatchersStatsChanged', (event) => {
        console.log('Watchers stats changed:', JSON.stringify(event.detail));
      });
</code></pre>

<p>
The json sent back is shown below. The intention is not to introduce many breaking changes,
will try to remain backwards compatibale as much as possibe,
but it is adviced when using newer versions to check if the json has changes,
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
      <td>Bulk permit counts per chain (used internally by angular app, this is probably not needed by callers of this component, it is there for completeness).</td>
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
      <td>Trigger permit counts per chain (used internally by angular app, this is probably not needed by callers of this component, it is there for completeness).</td>
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
    <tr>
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

<h2 id="full-usage-example">📄 Full Usage Example</h2>

As mentioned above a full usage example can be found at <br/>
<a href = "https://pwa-pages.github.io/rosen-watcher-pwa/web-component/rosen-watchers.html">https://pwa-pages.github.io/rosen-watcher-pwa/web-component/rosen-watchers.html</a>
This page always contains the latest versions of javascript and css, download those and use the component similarly as in the html.


<hr />

<h2 id="chain-performance">📺 <code>Chain performance</code></h2>

<h3>Description</h3>

<p>The <code>chain-performance</code> component can be used to render html with rosen bridge chain performance comparison
similar to https://pwa-pages.github.io/rosen-watcher-pwa/load.html?page=chainperformance.<br/>
All data from that screen can also be retrieved by a dom event in case
the intention is to design the html oneself. <br/>
In this way all relevant data is exposed through a dom event.
<br/><br/>
An example(and the place to download the needed javascripts) of usage of the component with the latest versions can be found at:
<br/><br/>
<a href = "https://pwa-pages.github.io/rosen-watcher-pwa/web-component/rosen-chain-performance.html">hhttps://pwa-pages.github.io/rosen-watcher-pwa/web-component/rosen-chain-performance.html</a> This file always contains the latest javascript versions with the latest build.
A css is added to that page and can be used to build on, but it can be ignored if all css needs to be custom.
<br/><br/>
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

<pre><code>&lt;rosen-watcher-component component="watchers" render-html="true"&lt;/rosen-watcher-component&gt;</code></pre>

<hr />

<h3>Events</h3>

<h4><code>notifyWatchersStatsChanged</code></h4>

<p>Fired whenever the internal watcher statistics update, watchers can send multiple events of type notifyWatchersStatsChanged
as it retrieves data from multiple sources and refreshes the data based on this,
so in the few first updates the data might still be incomplete,
but in the end after all updates the data is complete.
</p>

<p><strong>JavaScript usage:</strong></p>

<pre><code>const watchersEl = document.querySelector('rosen-watcher-component');

      watchersEl.addEventListener('notifyWatchersStatsChanged', (event) => {
        console.log('Watchers stats changed:', JSON.stringify(event.detail));
      });
</code></pre>

<p>
The json sent back is shown below. The intention is not to introduce many breaking changes,
will try to remain backwards compatibale as much as possibe,
but it is adviced when using newer versions to check if the json has changes,
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
      <td>Bulk permit counts per chain (used internally by angular app, this is probably not needed by callers of this component, it is there for completeness).</td>
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
      <td>Trigger permit counts per chain (used internally by angular app, this is probably not needed by callers of this component, it is there for completeness).</td>
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
    <tr>
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

<h2 id="full-usage-example">📄 Full Usage Example</h2>

As mentioned above a full usage example can be found at <br/>
<a href = "https://pwa-pages.github.io/rosen-watcher-pwa/web-component/rosen-watchers.html">https://pwa-pages.github.io/rosen-watcher-pwa/web-component/rosen-watchers.html</a>
This page always contains the latest versions of javascript and css, download those and use the component similarly as in the html.
