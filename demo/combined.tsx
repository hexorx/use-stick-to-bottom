import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp } from 'vue';
import { Demo as ReactDemo } from './Demo';
import VueDemo from './vue/Demo.vue';
import './index.css';

// Mount React demo
const reactRoot = document.getElementById('react-root');
if (reactRoot) {
  createRoot(reactRoot).render(createElement(ReactDemo));
}

// Mount Vue demo
const vueRoot = document.getElementById('vue-root');
if (vueRoot) {
  createApp(VueDemo).mount(vueRoot);
}
