<template>
  <div>
    <div class="radio-play-button" @click="startRadio">
      <div class="description">Listen to piano radio</div>
      <i class="fas fa-play fa-5x"></i>
    </div>

    <div id="info">
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-back"></div>
          <div class="flip-card-front"></div>
        </div>
      </div>
    </div>

    <div id="player-box" class="site">
      <div id="player-container">
        <div id="blank-overlay"></div>
        <div id="player-overlay">
          <vue-playr>
            <div data-plyr-provider="youtube" data-plyr-embed-id="bTqVqk7FSmY"></div>
          </vue-playr>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import VuePlayr from 'vue-playr';

export default {
  name: 'App',
  // components: { CurrentTrack },
  data() {
    return {
      tracks: [],
      errors: [],
      axiosTokenSources: [],
      youtubeId: '8tPnX7OPo0Q'
    };
  },
  created() {
    // const player = new Plyr('#embedded-player', {});
    // this.player = player;
    // window.player = player;
    //
    // window.player.on('ready', event => {
    //   // this.play();
    // });
  },
  mounted() {
    this.startRadio();
  },
  methods: {
    startRadio() {
      this.getNextTrack();
    },
    getNextTrack() {
      let CancelToken = axios.CancelToken;
      let source = CancelToken.source();
      let vm = this;
      this.axiosTokenSources.push(source);

      // start waiting
      // this.$wait.start('loading.tracks');

      axios.get('/api/v1/track/next', { cancelToken: source.token })
          .then(response => { // handle success
            response.data.forEach((track) => {
              this.tracks.push(track);
            })
            if (this.tracks[0].type === 'youtube') {
              this.player.source = {
                type: 'video',
                sources: [{
                  src: this.tracks[0].external_id,
                  provider: 'youtube',
                }],
              };
            }
          })
          .catch(e => { // handle error
            if (!axios.isCancel(e)) {
              this.errors.push('Error while retrieving tracks. Message: ${e.message}');
            }
          })
          .then(() => { // always executed
            // stop waiting
            // this.$wait.end('loading.tracks')
          })
    },
    play() {
      // if (this.$refs.plyr.player.paused) {
      //   // $(this).addClass('hide').addClass('shrink');
      //   this.$refs.plyr.player.play();
      //   this.$refs.plyr.player.currentTime = 60;
        // $('#info').addClass('show-mostly');
        // $('#player-box.site').addClass('show slow');
      // }
    },
    clear() {
      this.tracks = [];
      this.cancel()
    },
    cancel() {
      this.axiosTokenSources.forEach((source) => {
        source.cancel()
      })
    },
    loaded(img) {
      // this.$wait.end(`loading.photo-${img.id}`)
      this.photoGraphicFiles.push(img) // all photo image files (for counter)
      img.loaded = true
    }
  },
};
</script>