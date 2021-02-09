<template>
  <div class="page">
    <div :class="['radio-play-button', {'hide': startedRadio === 1, 'shrink': startedRadio === 1}]" @click="startRadio">
      <div class="description">Listen to piano radio</div>
      <i class="fas fa-play fa-5x"></i>
    </div>

    <div id="info" :class="{'show-mostly': Object.keys(currentTrack).length !== 0, 'hide': collapsedInfoBox == 1}">
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-back"></div>
          <div class="flip-card-front">
            <div class="radio-container radio-tracks">
              <div class="radio-contents">
                <div class="radio-options">
                  <i class="fas fa-minus collapse" @click="collapsedInfoBox = 1"></i>
                  <i class="fas fa-cog settings"></i>
                </div>
                <CurrentTrack v-if="Object.keys(currentTrack).length !== 0" :track="currentTrack.track_name" :artist="currentTrack.artist_name" :image="currentTrack.artist_image_url" url=""></CurrentTrack>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="player-box" :class="['site', {'show': Object.keys(currentTrack).length !== 0, 'slow': Object.keys(currentTrack).length !== 0}]">
      <div id="player-container" :class="{'unblur': collapsedInfoBox == 1}">
        <div id="blank-overlay" :class="{'background-transparent': collapsedInfoBox == 1}"></div>
        <div id="player-overlay">
          <vue-plyr ref="plyr">
            <div data-plyr-provider="youtube" data-plyr-embed-id="8tPnX7OPo0Q"></div>
          </vue-plyr>
        </div>
      </div>
    </div>

    <div class="footer">
      <div id="collapsed-track-playing" :class="{'show': collapsedInfoBox == 1}">
        <i class="expand fas fa-angle-up"></i>
        <div class="track-container">
          <CurrentTrack v-if="collapsedInfoBox" :track="currentTrack.track_name" :artist="currentTrack.artist_name" :image="currentTrack.artist_image_url" url=""></CurrentTrack>
        </div>
      </div>
      <ul>
        <li>
          <a href="#">About</a>
        </li>
      </ul>
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
      nextTracks: [],
      previousTracks: [],
      currentSeconds: 0,
      currentTrack: {},
      currentTrackRetrieved: 0,
      errors: [],
      axiosTokenSources: [],
      startedRadio: 0,
      showWaveForm: 1,
      collapsedInfoBox: 0,
      flippedInfoBox: 0,
    };
  },
  created() {
  },
  mounted() {
    this.$refs.plyr.player.on('pause', () => this.pause());
    this.$refs.plyr.player.on('play', () => this.play());
    this.$refs.plyr.player.on('ready', () => this.play());
    this.$refs.plyr.player.on('ended', () => this.ended());
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
          this.currentSeconds = response.data.current_seconds;
          response.data.previous_tracks.forEach((track) => {
            this.previousTracks.push(track);
          })
          response.data.next_tracks.forEach((track) => {
            this.nextTracks.push(track);
          })
          this.currentTrack = this.previousTracks[0];
          if (this.currentTrack.youtube_id !== null) {
            this.$refs.plyr.player.source = {
              type: 'video',
              sources: [{
                src: this.currentTrack.youtube_id,
                provider: 'youtube',
              }],
            };
            console.log(this.currentTrack);
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
      if (this.startedRadio == 1 && this.$refs.plyr.player.paused == true) {
        this.$refs.plyr.player.play();

        // Determine where we need to jump to.
        this.$refs.plyr.player.currentTime = (this.currentSeconds - this.currentTrack.secs_start);

        // Display the waveform.
        this.showWaveForm = 1;
        console.log(this.currentTrack);
      }
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
    },
    ended() {
    },
  },
};
</script>