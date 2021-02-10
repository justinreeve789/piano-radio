<template>
  <div class="page">
    <div :class="['radio-play-button', {'hide': startedRadio, 'shrink': startedRadio}]" @click="startRadio">
      <div class="description">Listen to piano radio</div>
      <i class="fas fa-play fa-5x"></i>
    </div>

    <div id="info" :class="{'show-mostly': Object.keys(currentTrack).length !== 0, 'hide': collapsedInfoBox == 1}">
      <div class="flip-card" :class="{'flipped': flippedInfoBox}">
        <div class="flip-card-inner">
          <div class="flip-card-back">
            <component :is="settingsComponent"></component>
          </div>
          <div class="flip-card-front">
            <div class="radio-container radio-tracks">
              <div class="radio-contents">
                <div class="radio-options">
                  <i class="fas fa-minus collapse" @click="collapsedInfoBox = 1"></i>
                  <i class="fas fa-cog settings" @click="toggleSettings"></i>
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
      <div id="collapsed-track-playing" :class="{'show': collapsedInfoBox == 1}" @click="collapsedInfoBox = 0">
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
import SettingsPiano from './SettingsPiano.vue';

export default {
  name: 'App',
  components: { CurrentTrack, SettingsPiano },
  data() {
    return {
      nextTracks: [],
      previousTracks: [],
      currentSeconds: 0,
      currentTick: 0,
      currentTrack: {},
      currentTrackRetrieved: false,
      errors: [],
      axiosTokenSources: [],
      startedRadio: false,
      showWaveForm: true,
      collapsedInfoBox: false,
      flippedInfoBox: false,
      settingsComponent: settingsComponent,
    };
  },
  created() {
  },
  mounted() {
    this.$refs.plyr.player.on('pause', () => this.pause());
    this.$refs.plyr.player.on('play', () => this.play());
    this.$refs.plyr.player.on('ready', () => this.play());
    this.$refs.plyr.player.on('ended', () => this.ended());
    this.$refs.plyr.player.on('timeupdate', () => this.timeupdate());
  },
  methods: {
    startRadio() {
      this.startedRadio = 1;
      this.getNextTrack();
    },
    toggleSettings() {
      this.flippedInfoBox = !this.flippedInfoBox;
    },
    getNextTrack() {
      let CancelToken = axios.CancelToken;
      let source = CancelToken.source();
      let vm = this;
      this.axiosTokenSources.push(source);

      if (this.nextTracks.length > 0) {
        this.previousTracks.push(this.currentTrack);
        this.currentTrack = this.nextTracks.pop();
        this.play();
        return;
      }

      axios.get('/api/v1/track/next', { cancelToken: source.token })
        .then(response => { // handle success
          this.currentSeconds = response.data.current_seconds;
          this.currentTrack = response.data.current_track;
          response.data.previous_tracks.forEach((track) => {
            this.previousTracks.push(track);
          })
          response.data.next_tracks.forEach((track) => {
            this.nextTracks.push(track);
          })
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
    timeupdate() {
      let currentTimeRounded = Math.round(this.$refs.plyr.player.currentTime);
      if (this.currentTick != currentTimeRounded) {
        this.currentTick = currentTimeRounded;
        console.log(this.currentTick);
        this.play();

        // Check if we need to stop the track.
        let stopTick = this.currentTrack.youtube_duration_ms;
        let endMs = this.currentTrack.youtube_end_ms ?? this.currentTrack.youtube_duration_ms;
        let startMs = this.currentTrack.youtube_start_ms ?? 0;
        let extraMs = this.currentTrack.youtube_post_ms ?? 0;
        if (this.currentTick > (endMs - startMs + extraMs) / 1000) {
          this.getNextTrack();
        }
      }
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
    pause() {
      // TODO: Check every 1 second if we're paused, and then auto-play.
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
      this.getNextTrack();
    },
  },
};
</script>