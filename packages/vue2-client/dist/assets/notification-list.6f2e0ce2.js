import{P as _,W as h,C as u,V as m,n as p,S as g,a as C}from"./index.bd25dbec.js";var y=Object.defineProperty,$=Object.getOwnPropertyDescriptor,l=(e,t,s,o)=>{for(var i=o>1?void 0:o?$(t,s):t,a=e.length-1,r;a>=0;a--)(r=e[a])&&(i=(o?r(t,s,i):r(i))||i);return o&&i&&y(t,s,i),i};let n=class extends m{constructor(){super(...arguments),this.loading=!0,this.isClosed=!1}created(){this.setupTimed()}mounted(){this.loading=!1}beforeDestroy(){clearTimeout(this.timedClose)}messageChanged(){this.message!=""&&(clearTimeout(this.timedClose),this.setupTimed(),this.isClosed=!1)}get determineNotificationClass(){return"notification--message--"+this.type}close(){this.isClosed=!0,this.$emit("notification-closed",this.message),clearTimeout(this.timedClose)}setupTimed(){this.timed&&(this.timedClose=setTimeout(this.close,this.delay*1e3))}};l([_({default:!1})],n.prototype,"timed",2);l([_({required:!1,default:"alert"})],n.prototype,"type",2);l([_()],n.prototype,"message",2);l([_({default:5})],n.prototype,"delay",2);l([h("message")],n.prototype,"messageChanged",1);n=l([u({})],n);var P=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("transition",{attrs:{name:"slide-right",mode:"out-in"}},[!e.loading&&!e.isClosed?s("div",{staticClass:"notification"},[s("div",{staticClass:"content-column"},[s("div",{class:["notification--message",e.determineNotificationClass]},[s("span",{domProps:{innerHTML:e._s(e.message)}}),s("div",{staticClass:"notification--close",on:{click:e.close}},[s("i",{staticClass:"material-icons"},[e._v("close")])])])])]):e._e()])},x=[];const d={};var N=p(n,P,x,!1,O,"1b9f0c9b",null,null);function O(e){for(let t in d)this[t]=d[t]}var T=function(){return N.exports}(),b=Object.defineProperty,j=Object.getOwnPropertyDescriptor,v=(e,t,s,o)=>{for(var i=o>1?void 0:o?j(t,s):t,a=e.length-1,r;a>=0;a--)(r=e[a])&&(i=(o?r(t,s,i):r(i))||i);return o&&i&&b(t,s,i),i};let c=class extends m{closed(e){C.dismiss(this.state.notifications.findIndex(t=>t.message==e))}};v([g("Notification")],c.prototype,"state",2);c=v([u({components:{Notification:T}})],c);var D=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"notification-list"},e._l(e.state.notifications,function(o,i){return s("div",{key:i},[s("notification",{attrs:{type:o.type,timed:o.timed,message:o.message},on:{"notification-closed":e.closed}})],1)}),0)},w=[];const f={};var L=p(c,D,w,!1,M,"2199d6de",null,null);function M(e){for(let t in f)this[t]=f[t]}var E=function(){return L.exports}();export{E as N};
