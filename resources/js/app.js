import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VuePlayr from 'vue-playr'

Vue.use(VuePlayr, VueAxios, axios)

import App from './views/App'

const app = new Vue({
    el: '#app',
    components: { App },
    data: {
    },
});
