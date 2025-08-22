const d=({period:r,backgroundColor:s,chartTitle:m,chartColor:p,accentChartColor:n,address1:c,address2:a})=>{const e=document.createElement("rosen-watcher-component");return e.setAttribute("component","performance"),e.setAttribute("render-html","true"),e.setAttribute("address1",c),e.setAttribute("address2",a),e.setAttribute("accent-chart-color",n),e.setAttribute("style","border:1px solid black; width: 500px; height:300px; display: block;"),e.style.backgroundColor=s,e},o={address1:"9f6pDdMhgYrHoCcQmGVuSzSx7nWaRwVPKASvEeKUeWTmvTVRZ38",address2:"",accentChartColor:"#666666"},u={title:"Components/Performance",tags:["autodocs"],render:r=>d({...r}),argTypes:{backgroundColor:{control:"color"},accentChartColor:{control:"color"},address1:{control:"text"},address2:{control:"text"}},args:o};function l(r){return`

    <rosen-watcher-component
      style="display: block; width: 500px; height: 300px; float: left"
      component="performance"
      address1="${r.address1||""}"
      address2="${r.address2||""}"
      render-html="true"
      accent-chart-color="${r.accentChartColor||""}">
      
    </rosen-watcher-component>

  `}const t={name:"Explore Component",args:{},parameters:{docs:{source:{code:l(o)}}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: 'Explore Component',
  args: {},
  parameters: {
    docs: {
      source: {
        code: buildSourceCode(baseArgs)
      }
    }
  }
}`,...t.parameters?.docs?.source}}};const i=["Primary"];export{t as Primary,i as __namedExportsOrder,u as default};
