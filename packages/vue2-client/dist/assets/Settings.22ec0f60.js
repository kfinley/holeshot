import{n as i,U as f,d,S as p,C as $,V as m}from"./index.ec230aef.js";var S=function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",[e("h3",{attrs:{align:"center"}},[t._v("User Settings")]),e("card",[t.editing?t._t("default"):e("entity",{attrs:{entity:t.state.currentUser},scopedSlots:t._u([{key:"expand",fn:function(){},proxy:!0}],null,!1,3512240879)}),e("div",{attrs:{slot:"footer"},slot:"footer"},[t.editing?e("Button",{on:{click:t.save}},[t._v(" Save ")]):e("Button",{on:{click:t.edit}},[t._v(" Edit ")])],1)],2)],1)},g=[];const l={};var h=i(f,S,g,!1,x,null,null,null);function x(t){for(let n in l)this[n]=l[n]}var y=function(){return h.exports}(),U=function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",[t._l(Object.keys(t.user),function(s,r){return e("div",{key:r},[s=="GPS"?e("div",[t._v("GPS Edit")]):t._e(),e("div",[t._v(t._s(t.toSentence(s))+": "+t._s(t.user[s]))])])}),e("div",[t._v("Lat: "+t._s(t.lat)+" Long: "+t._s(t.long))])],2)},E=[];const c={};var j=i(d,U,E,!1,P,null,null,null);function P(t){for(let n in c)this[n]=c[n]}var C=function(){return j.exports}(),O=Object.defineProperty,b=Object.getOwnPropertyDescriptor,v=(t,n,e,s)=>{for(var r=s>1?void 0:s?b(n,e):n,_=t.length-1,a;_>=0;_--)(a=t[_])&&(r=(s?a(n,e,r):a(r))||r);return s&&r&&O(n,e,r),r};let o=class extends m{};v([p("User")],o.prototype,"state",2);o=v([$({components:{UserSettings:y,EditUser:C}})],o);var F=function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",{staticClass:"p-4"},[e("user-settings",[e("edit-user",{attrs:{user:t.state.currentUser}})],1)],1)},M=[];const u={};var R=i(o,F,M,!1,w,null,null,null);function w(t){for(let n in u)this[n]=u[n]}var D=function(){return R.exports}();export{D as default};