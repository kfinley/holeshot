import{n as i,U as f,e as S,S as d,C as p,V as m}from"./index.c10b7072.js";var $=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",[t("h3",{attrs:{align:"center"}},[e._v("User Settings")]),t("card",[e.editing?e._t("default"):t("entity",{attrs:{entity:e.state.currentUser,exclude:e.exclude},scopedSlots:e._u([{key:"expand",fn:function(){},proxy:!0}],null,!1,3512240879)}),t("div",{attrs:{slot:"footer"},slot:"footer"},[e.editing?t("Button",{on:{click:e.save}},[e._v(" Save ")]):t("Button",{on:{click:e.edit}},[e._v(" Edit ")])],1)],2)],1)},x=[];const l={};var g=i(f,$,x,!1,h,null,null,null);function h(e){for(let n in l)this[n]=l[n]}var y=function(){return g.exports}(),U=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",[e._l(Object.keys(e.user),function(r,s){return t("div",{key:s},[r=="GPS"?t("div",[e._v("GPS Edit")]):e._e(),e.include(r)?t("div",[e._v(e._s(e.toSentence(r))+": "+e._s(e.user[r]))]):e._e()])}),t("div",[e._v("Lat: "+e._s(e.lat)+" Long: "+e._s(e.long))]),e.error?t("div",[e._v(e._s(e.error))]):e._e()],2)},E=[];const u={};var j=i(S,U,E,!1,P,null,null,null);function P(e){for(let n in u)this[n]=u[n]}var b=function(){return j.exports}(),C=Object.defineProperty,O=Object.getOwnPropertyDescriptor,c=(e,n,t,r)=>{for(var s=r>1?void 0:r?O(n,t):n,_=e.length-1,a;_>=0;_--)(a=e[_])&&(s=(r?a(n,t,s):a(s))||s);return r&&s&&C(n,t,s),s};let o=class extends m{};c([d("User")],o.prototype,"userState",2);c([d("WebSockets")],o.prototype,"socketState",2);o=c([p({components:{UserSettings:y,UserEdit:b}})],o);var k=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{staticClass:"p-4"},[t("user-settings",{attrs:{exclude:"['username']"}},[t("user-edit",{attrs:{user:e.userState.currentUser}}),t("div",[t("div",[e._v("WebSocketStatus: "+e._s(e.socketState.status))])])],1)],1)},F=[];const v={};var M=i(o,k,F,!1,R,null,null,null);function R(e){for(let n in v)this[n]=v[n]}var B=function(){return M.exports}();export{B as default};