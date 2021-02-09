import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VuePlyr from 'vue-plyr'

Vue.use(VuePlyr, VueAxios, axios)

import App from './views/App'
import CurrentTrack from './views/App'

const app = new Vue({
    el: '#app',
    components: { App, CurrentTrack },
    data: {
    },
});