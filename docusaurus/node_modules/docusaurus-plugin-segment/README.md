# docusaurus-plugin-segment

A Docusaurus plugin for [Segment API Analytics](https://www.segment.com/) based on prior work by [Moesif](https://github.com/Moesif/docusaurus-plugin-segment)

Disclaimer: This is a community plugin. It may not work. Use at your own risk.



## How to install

1. Install `docusaurus-plugin-segment`

  `npm install --save docusaurus-plugin-segment`

2. Add plugin to `docusaurus.config.js`


Method a: use themeConfig with Docusaurus v1


```javascript
module.exports = {
  plugins: ['docusaurus-plugin-segment'],
  themeConfig: {
    segment: {
      apiKey: 'Your Segment Write API Key',
      // Add other options here.
    },
  },
};
```

Method b: use plugin options with Docusaurus v2

```javascript
module.exports = {
  plugins: [
    'docusaurus-plugin-segment',
    {
      apiKey: 'Your Segment Write API Key'
      // Add other options here.
    }
  ]
}
```

3. Test it works

Because the plugin is disabled when `NODE_ENV` is set to development, you'll want to create a production build: 

```
npm run build

npm run serve
```

## How to use

Any of the Segment browser APIs are accessible via `window.analytics`.
The plugin tracks page views automatically but we also recommend [identifying the user](https://segment.com/docs/connections/spec/identify/) like so:

```javascript
window.analytics.identify("97980cfea0067", {
  name: "Peter Gibbons",
  email: "peter@example.com",
  plan: "premium",
  logins: 5
});
```

## Configuration Options

For full list of configuration options, [see this page](https://github.com/segmentio/snippet).

The `page` option defaults to false, and the plugin will use a hook to send page tracking events.
