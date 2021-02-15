import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VuePlyr from 'vue-plyr';
import VueCookies from 'vue-cookies';

Vue.use(VueAxios, axios).use(VueCookies).use(VuePlyr, {
    plyr: {
        clickToPlay: false,
        debug: false,
        keyboard: { focused: false },
        fullscreen: { enabled: false },
        storage: { key: 'radio' },
    }
});

import App from './views/App'
import CurrentTrack from './views/App'

const app = new Vue({
    el: '#app',
    components: { App },
    data: {
    },
});