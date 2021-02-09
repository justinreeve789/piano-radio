import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueRouter from 'vue-router'
import VueWait from 'vue-wait'

Vue.use(VueWait, VueRouter, VueAxios, axios)

import App from './views/App'

const router = new VueRouter({
    linkActiveClass: 'active',
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'home',
            component: App
        },
    ],
});

const app = new Vue({
    el: '#app',
    components: { App },
    data: {
        youtubeId: null
    },
    wait: new VueWait(),
});