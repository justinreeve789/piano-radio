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
          <div id="embedded-player" data-plyr-provider="youtube" v-bind:data-plyr-embed-id="youtubeId"></div>
        </div>
      </div>
    </div>  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
//  components: { CurrentTrack },
  data() {
    return {
      tracks: [],
      errors: [],
      axiosTokenSources: [],
    }
  },
  mounted: function() {
    this.startRadio();
  },
  methods: {
    startRadio() {
      this.getNextTrack();
    },
    getNextTrack() {
      let CancelToken = axios.CancelToken;
      let source = CancelToken.source();
      this.axiosTokenSources.push(source);

      // start waiting
      this.$wait.start('loading.tracks');

      axios.get('/api/v1/track/next', { cancelToken: source.token })
          .then(response => { // handle success
            response.data.forEach((previousTracks) => {
              this.tracks.push(track);
            })
            let currentTrack = this.tracks[0];
            console.log(response);
          })
          .catch(e => { // handle error
            if (!axios.isCancel(e)) {
              this.errors.push('Error while retrieving tracks. Message: ${e.message}');
            }
          })
          .then(() => { // always executed
            // stop waiting
            this.$wait.end('loading.tracks')
          })
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
      this.$wait.end(`loading.photo-${img.id}`)
      this.photoGraphicFiles.push(img) // all photo image files (for counter)
      img.loaded = true
    }
  },
  beforeRouteLeave(to, from, next) {
    this.clear()
    next()
  }
};
</script>