import{C as u,b as p,d as v,V as c,R as f,u as g,A as _,f as b,n as h}from"./index.0f6e41bb.js";import{C as w,R as d}from"./card.55ef1a08.js";import{S as y}from"./bindings.058d8fe1.js";var x=Object.defineProperty,C=Object.getOwnPropertyDescriptor,n=(e,r,t,a)=>{for(var s=a>1?void 0:a?C(r,t):r,i=e.length-1,l;i>=0;i--)(l=e[i])&&(s=(a?l(r,t,s):l(s))||s);return a&&s&&x(r,t,s),s};let o=class extends c{constructor(){super(...arguments),this.email="",this.password="",this.registerRoute=f.Register}mounted(){var e;(e=this.emailElement)==null||e.focus()}async onSubmit(){await this.formObserver.validate()&&g.login({email:this.email,password:this.password})}get loggingIn(){return this.state.authStatus===_.LoggingIn}get messages(){return b}};n([d()],o.prototype,"formObserver",2);n([d()],o.prototype,"emailElement",2);n([y("User")],o.prototype,"state",2);o=n([u({components:{ValidationProvider:p,ValidationObserver:v,Card:w}})],o);var P=function(){var e=this,r=e.$createElement,t=e._self._c||r;return t("card",{staticStyle:{height:"90vh"},attrs:{"header-text":"Login","show-close":!1,"max-width":"600px",padding:"2"}},[t("ValidationObserver",{ref:"formObserver"},[t("form",{attrs:{autocomplete:"off",role:"form text-left"},on:{submit:function(a){return a.preventDefault(),e.onSubmit.apply(null,arguments)}}},[t("div",{staticClass:"mb-3"},[t("ValidationProvider",{attrs:{name:"email",type:"email",rules:"required|email",mode:"passive"},scopedSlots:e._u([{key:"default",fn:function(a){var s=a.errors;return[t("input",{directives:[{name:"model",rawName:"v-model",value:e.email,expression:"email"}],ref:"emailElement",class:["form-control",{"is-invalid":s[0]}],attrs:{type:"email",placeholder:"Email","aria-label":"Email",disabled:e.loggingIn},domProps:{value:e.email},on:{input:function(i){i.target.composing||(e.email=i.target.value)}}}),t("div",{directives:[{name:"show",rawName:"v-show",value:s[0],expression:"errors[0]"}],staticClass:"invalid-feedback"},[e._v(" "+e._s(s[0])+" ")])]}}])})],1),t("div",{staticClass:"mb-3"},[t("ValidationProvider",{attrs:{name:"password",rules:"required",mode:"passive"},scopedSlots:e._u([{key:"default",fn:function(a){var s=a.errors;return[t("input",{directives:[{name:"model",rawName:"v-model",value:e.password,expression:"password"}],class:["form-control",{"is-invalid":s[0]}],attrs:{type:"password",placeholder:"Password","aria-label":"Password",disabled:e.loggingIn},domProps:{value:e.password},on:{input:function(i){i.target.composing||(e.password=i.target.value)}}}),t("div",{directives:[{name:"show",rawName:"v-show",value:s[0],expression:"errors[0]"}],staticClass:"invalid-feedback"},[e._v(" "+e._s(s[0])+" ")])]}}])})],1),t("div",{staticClass:"text-center"},[t("button",{staticClass:"btn primary-gradient w-100 my-4 mb-2",attrs:{type:"submit",disabled:e.loggingIn}},[e.loggingIn?t("span",{staticClass:"spinner-border spinner-border-sm",attrs:{role:"status","aria-hidden":"true"}}):e._e(),e._v(" Log in ")])])])]),t("p",{staticClass:"text-sm mt-3 mb-0"},[e._v(" Need an account? "),t("router-link",{staticClass:"text-dark font-weight-bolder",attrs:{to:{name:e.registerRoute}}},[e._v("Register")])],1)],1)},S=[];const m={};var O=h(o,P,S,!1,R,null,null,null);function R(e){for(let r in m)this[r]=m[r]}var L=function(){return O.exports}();export{L as default};
