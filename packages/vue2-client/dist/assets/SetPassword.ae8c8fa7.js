import{P as m,S as v,C as c,f as w,h as f,i as _,V as h,u as l,A as g,m as P,R as u,n as b}from"./index.f4781a65.js";var y=Object.defineProperty,C=Object.getOwnPropertyDescriptor,n=(s,a,e,t)=>{for(var r=t>1?void 0:t?C(a,e):a,o=s.length-1,d;o>=0;o--)(d=s[o])&&(r=(t?d(a,e,r):d(r))||r);return t&&r&&y(a,e,r),r};let i=class extends h{constructor(){super(...arguments),this.password1="",this.password2=""}mounted(){var e;(e=this.password1Element)==null||e.focus();const[s,a]=this.regCode.split("|");this.username=s,this.previousPassword=a,console.log(`${s} : ${a}`),l.login({email:this.username,password:this.previousPassword})}async onSubmit(){await this.formObserver.validate()&&l.changePassword({username:this.username,previousPassword:this.previousPassword,proposedPassword:this.password1})}get processing(){return this.state.authStatus===g.SettingPassword}get messages(){return P}};n([u()],i.prototype,"formObserver",2);n([u()],i.prototype,"password1Element",2);n([m()],i.prototype,"regCode",2);n([v("User")],i.prototype,"state",2);i=n([c({components:{ValidationProvider:w,ValidationObserver:f,Card:_}})],i);var S=function(){var s=this,a=s.$createElement,e=s._self._c||a;return e("card",{staticStyle:{height:"90vh"},attrs:{"header-text":"Set Password","show-close":!1,"max-width":"600px",padding:"2"}},[e("ValidationObserver",{ref:"formObserver"},[e("form",{attrs:{autocomplete:"off",role:"form text-left"},on:{submit:function(t){return t.preventDefault(),s.onSubmit.apply(null,arguments)}}},[e("div",{staticClass:"mb-3"},[e("ValidationProvider",{attrs:{name:"password1",rules:"required",mode:"passive"},scopedSlots:s._u([{key:"default",fn:function(t){var r=t.errors;return[e("input",{directives:[{name:"model",rawName:"v-model",value:s.password1,expression:"password1"}],ref:"password1Element",class:["form-control",{"is-invalid":r[0]}],attrs:{type:"password",placeholder:"Password","aria-label":"Password",disabled:s.processing},domProps:{value:s.password1},on:{input:function(o){o.target.composing||(s.password1=o.target.value)}}}),e("div",{directives:[{name:"show",rawName:"v-show",value:r[0],expression:"errors[0]"}],staticClass:"invalid-feedback"},[s._v(" "+s._s(r[0])+" ")])]}}])})],1),e("div",{staticClass:"mb-3"},[e("ValidationProvider",{attrs:{name:"password2",rules:"required",mode:"passive"},scopedSlots:s._u([{key:"default",fn:function(t){var r=t.errors;return[e("input",{directives:[{name:"model",rawName:"v-model",value:s.password2,expression:"password2"}],class:["form-control",{"is-invalid":r[0]}],attrs:{type:"password",placeholder:"Confirm Password","aria-label":"Confirm Password",disabled:s.processing},domProps:{value:s.password2},on:{input:function(o){o.target.composing||(s.password2=o.target.value)}}}),e("div",{directives:[{name:"show",rawName:"v-show",value:r[0],expression:"errors[0]"}],staticClass:"invalid-feedback"},[s._v(" "+s._s(r[0])+" ")])]}}])})],1),e("div",{staticClass:"text-center"},[e("button",{staticClass:"btn primary-gradient w-100 my-4 mb-2",attrs:{type:"submit",disabled:s.processing}},[s.processing?e("span",{staticClass:"spinner-border spinner-border-sm",attrs:{role:"status","aria-hidden":"true"}}):s._e(),s._v(" Set Password ")])])])])],1)},x=[];const p={};var O=b(i,S,x,!1,V,null,null,null);function V(s){for(let a in p)this[a]=p[a]}var N=function(){return O.exports}();export{N as default};
