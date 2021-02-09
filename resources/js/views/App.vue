<template>
  <div class="page">
    <div :class="['radio-play-button', {'hide': startedRadio === 1, 'shrink': startedRadio === 1}]" @click="startRadio">
      <div class="description">Listen to piano radio</div>
      <i class="fas fa-play fa-5x"></i>
    </div>

    <div id="info">
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-back"></div>
          <div class="flip-card-front">
            <CurrentTrack v-if="startedRadio" track-name="" track-artist="" track-image=""></CurrentTrack>
          </div>
        </div>
      </div>
    </div>

    <div id="player-box" class="site">
      <div id="player-container">
        <div id="blank-overlay"></div>
        <div id="player-overlay">
          <vue-plyr ref="plyr">
            <div id="embedded-player" data-plyr-provider="youtube" v-bind:data-plyr-embed-id="youtubeId"></div>
          </vue-plyr>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import VuePlyr from 'vue-plyr';
import CurrentTrack from './CurrentTrack.vue';

export default {
  name: 'App',
  components: { CurrentTrack },
  data() {
    return {
      tracks: [],
      errors: [],
      axiosTokenSources: [],
      startedRadio: 0,
      youtubeId: '8tPnX7OPo0Q'
    };
  },
  created() {
    // const player = new Plyr('#embedded-player', {});
    // this.player = player;
    // window.player = player;
    // window.player.on('ready', event => {
    //   // this.play();
    // });
  },
  mounted() {
    this.$refs.plyr.player.on('pause', () => this.pause());
    this.$refs.plyr.player.on('play', () => this.play());
    // this.$refs.plyr.player.on('ready', () => this.startRadio());
  },
  methods: {
    startRadio() {
      this.startedRadio = 1;
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
              this.$refs.plyr.player.source = {
                type: 'video',
                sources: [{
                  src: 'https://www.youtube.com/embed/' + this.tracks[0].external_id + '?showinfo=0&enablejsapi=1&origin=https://dev.pianoradio.org',
                  provider: 'youtube',
                }],
              };
              this.play();
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
      console.log('PLAY');
      console.log(this.$refs.plyr.player.paused);
//      if (this.$refs.plyr.player.paused) {
        $(this).addClass('hide').addClass('shrink');
        $('#info').addClass('show-mostly');
        $('#player-box.site').addClass('show slow');
        console.log('PLAYING');
        this.$refs.plyr.player.play();
        console.log('PLAYED');
        this.$refs.plyr.player.currentTime = 60;
//      }
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