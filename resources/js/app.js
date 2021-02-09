import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VuePlyr from 'vue-plyr';

Vue.use(VueAxios, axios).use(VuePlyr, {
    plyr: {
        clickToPlay: false,
        debug: true,
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