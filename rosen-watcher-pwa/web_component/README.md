<h1>🔧 Angular Elements Web Component Library</h1>

<p>This project contains a growing collection of reusable, standalone web components built with <strong>Angular Elements</strong>. These components are framework-agnostic and work in any HTML/JavaScript environment — no Angular required in the host app.</p>

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
      <td><a href="#app-watchers"><code>&lt;app-watchers&gt;</code></a></td>
      <td>Displays watcher stats with real-time updates</td>
    </tr>
    <tr>
      <td><code>&lt;app-compare-chain-rewards&gt;</code></td>
      <td><em>(Coming soon)</em> Compare rewards per chain</td>
    </tr>
  </tbody>
</table>

<hr />

<h2 id="app-watchers">📺 <code>&lt;app-watchers&gt;</code></h2>

<h3>Description</h3>

<p>The <code>&lt;app-watchers&gt;</code> component displays live watcher data and emits an event when the underlying stats change. It is ideal for dashboards, monitoring tools, or any interface that reacts to changes in watcher activity.</p>

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
      <td>Enables or disables rendering of inner HTML content inside the component. Defaults to <code>"false"</code>.</td>
    </tr>
  </tbody>
</table>

<p><strong>Example:</strong></p>

<pre><code>&lt;app-watchers render-html="true"&gt;&lt;/app-watchers&gt;</code></pre>

<hr />

<h3>Events</h3>

<h4><code>notifyWatchersStatsChanged</code></h4>

<p>Fired whenever the internal watcher statistics update.</p>

<p><strong>JavaScript usage:</strong></p>

<pre><code>const watchersEl = document.querySelector('app-watchers');

watchersEl.addEventListener('notifyWatchersStatsChanged', (event) =&gt; {
  console.log('Watchers stats changed:', JSON.stringify(event.detail));
});
</code></pre>

<hr />

<h2 id="full-usage-example">📄 Full Usage Example</h2>

<pre><code>&lt;!doctype html&gt;
&lt;html lang="en"&gt;
  &lt;head&gt;
    &lt;meta charset="UTF-8" /&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0" /&gt;
    &lt;title&gt;Web Component Example&lt;/title&gt;

    &lt;link rel="stylesheet" href="styles.css" media="all" onload="this.media='all'" /&gt;

    &lt;script src="runtime.js" type="module"&gt;&lt;/script&gt;
    &lt;script src="main.js" type="module"&gt;&lt;/script&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;app-watchers render-html="true"&gt;&lt;/app-watchers&gt;

    &lt;script&gt;
      const watchersEl = document.querySelector('app-watchers');

      watchersEl.addEventListener('notifyWatchersStatsChanged', (event) =&gt; {
        console.log('Watchers stats changed:', JSON.stringify(event.detail));
      });
    &lt;/script&gt;
  &lt;/body&gt;
&lt;/html&gt;
</code></pre>

