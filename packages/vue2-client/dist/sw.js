if(!self.define){let s,e={};const i=(i,l)=>(i=new URL(i+".js",l).href,e[i]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=i,s.onload=e,document.head.appendChild(s)}else s=i,importScripts(i),e()})).then((()=>{let s=e[i];if(!s)throw new Error(`Module ${i} didn’t register its module`);return s})));self.define=(l,r)=>{const n=s||("document"in self?document.currentScript.src:"")||location.href;if(e[n])return;let t={};const o=s=>i(s,n),u={module:{uri:n},exports:t,require:o};e[n]=Promise.all(l.map((s=>u[s]||o(s)))).then((s=>(r(...s),t)))}}define(["./workbox-d2983725"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"assets/Articles.660eb822.js",revision:null},{url:"assets/Articles.7be7ffd0.js",revision:null},{url:"assets/example-post.251bbd3d.js",revision:null},{url:"assets/Home.d8916dff.js",revision:null},{url:"assets/index.ca2d99ca.js",revision:null},{url:"assets/LayoutArticle.1b2033cb.js",revision:null},{url:"assets/LayoutDefault.e4275b00.js",revision:null},{url:"assets/Login.18bdce72.js",revision:null},{url:"assets/notification-list.a7d7d55f.js",revision:null},{url:"assets/Register.fadd0858.js",revision:null},{url:"assets/Scheduler.569ed09b.js",revision:null},{url:"assets/SetPassword.b480d13b.js",revision:null},{url:"assets/Settings.21fe6fe0.js",revision:null},{url:"assets/style.9c08e272.css",revision:null},{url:"assets/virtual_pwa-register.f78bd6a5.js",revision:null},{url:"assets/workbox-window.prod.es5.f4b3e527.js",revision:null},{url:"config.js",revision:"a6f4a3dfd1ff39e63b8369ba46d065af"},{url:"index.html",revision:"a5e2cef1cba9a4430e64f8d06371b83e"},{url:"manifest.webmanifest",revision:"27cff651dce722a6890a316d6ae01f55"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
