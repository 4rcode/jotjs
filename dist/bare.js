// @ts-self-types="../src/main/bare.ts"
function i(e,...n){return()=>o(e.cloneNode(!0),...n)}function o(e,...n){if(typeof e=="string")return o(document.createElement(e),...n);for(let t of n)typeof t=="function"?t(e):typeof t=="object"&&"jot"in t?t.jot(e):typeof t=="string"||t instanceof Node?e.append(t):Object.assign(e,t);return e}var r=new Proxy({},{get(e,n,t){return typeof n=="string"?(...a)=>o(n,...a):Reflect.get(e,n,t)}});export{i as clone,o as jot,r as tags};
//# sourceMappingURL=bare.js.map
