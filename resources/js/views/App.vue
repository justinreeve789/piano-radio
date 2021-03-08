<template>
  <div :class="['page', {'mobile-device': isMobile.any}]">
    <div :class="['radio-play-button', {'hide': startedRadio, 'shrink': startedRadio}]" @click="startRadio">
      <div class="description"></div>
      <i class="fas fa-play fa-6x"></i>
    </div>

    <div id="info" :class="{'show-mostly': Object.keys(currentTrack).length !== 0, 'hide': collapsedInfoBox == 1}">
      <div class="flip-card" :class="{'flipped': flippedInfoBox}">
        <div class="flip-card-inner">
          <div class="flip-card-back">
            <component :is="settingsComponent" :settings="settings"></component>
          </div>
          <div class="flip-card-front">
            <div class="radio-container radio-tracks">
              <div class="radio-contents">
                <div class="radio-options">
                  <i class="fas fa-minus collapse" @click="collapsedInfoBox = 1"></i>
                  <i class="fas fa-cog settings" @click="toggleSettings"></i>
                </div>
                <CurrentTrack v-if="Object.keys(currentTrack).length !== 0" :track="currentTrack.track_name" :artist="currentTrack.artist_name" :image="currentTrack.artist_image_url" url="#"></CurrentTrack>
                <component v-if="isAdmin === 1 && Object.keys(currentTrack).length !== 0" :is="adminComponent" :currentTrack="currentTrack"></component>
                <PreviousTracks v-if="previousTracks.length > 0"></PreviousTracks>
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
            <div data-plyr-provider="youtube" data-plyr-embed-id="."></div>
          </vue-plyr>
        </div>
      </div>
    </div>

    <div class="footer">
      <div :class="{'hide': collapsedInfoBox || loading || isMobile.any}">
        Leave this window open to continue listening
      </div>
      <div id="collapsed-track-playing" :class="{'show': collapsedInfoBox}" @click="collapsedInfoBox = 0">
        <i class="expand fas fa-angle-up"></i>
        <div class="track-container">
          <CurrentTrack v-if="collapsedInfoBox" :track="currentTrack.track_name" :artist="currentTrack.artist_name" :image="currentTrack.artist_image_url" url="#"></CurrentTrack>
        </div>
      </div>
    </div>

    <div :class="['loading', {'show': loading}]">
      <i class="loading-icon fas fa-spinner fa-pulse fa-10x"></i>
      <div class="loading-text">
        {{ loadingText }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import VuePlyr from 'vue-plyr';
import VueCookies from 'vue-cookies';
import CurrentTrack from './CurrentTrack.vue';
import PreviousTracks from './PreviousTracks.vue';
import SettingsPiano from './SettingsPiano.vue';
import AdminPiano from './AdminPiano.vue';
import SettingsChristmasPiano from './SettingsChristmasPiano.vue';
import AdminChristmasPiano from './AdminChristmasPiano.vue';

export default {
  name: 'App',
  components: { CurrentTrack, PreviousTracks, SettingsPiano, AdminPiano, SettingsChristmasPiano, AdminChristmasPiano },
  data() {
    return {
      selectedType: selectedType,
      selectedId: selectedId,
      nextTracks: [],
      previousTracks: [],
      currentSeconds: 0,
      currentTick: 0,
      baseVolume: 1.0,
      currentTrack: {},
      currentTrackRetrieved: false,
      errors: [],
      axiosTokenSources: [],
      isAdmin: 0,
      startedRadio: false,
      showWaveForm: true,
      collapsedInfoBox: false,
      flippedInfoBox: false,
      loading: false,
      loadingText: '',
      adminComponent: adminComponent,
      settingsComponent: settingsComponent,
      isMobile: isMobile,
      settingsChanged: false,
      settings: {},
    };
  },
  created() {
    this.initializeSettings();
  },
  mounted() {
    this.$refs.plyr.player.on('pause', () => this.pause());
    this.$refs.plyr.player.on('play', () => this.play());
    this.$refs.plyr.player.on('ready', () => this.play());
    this.$refs.plyr.player.on('ended', () => this.ended());
    this.$refs.plyr.player.on('timeupdate', () => this.timeupdate());
    this.isAdmin = this.$cookies.get('admin');

    // Trigger the radio play button click, if we can.
    // let button = document.getElementsByClassName('radio-play-button')[0];
    // let event = document.createEvent('HTMLEvents');
    // event.initEvent('click', true, false);
    // button.dispatchEvent(event);
  },
  methods: {
    startRadio() {
      this.startedRadio = 1;
      this.loadingText = 'Loading station';
      this.loading = true;
      this.getNextTrack();
    },
    toggleSettings() {
      this.flippedInfoBox = !this.flippedInfoBox;

      if (this.settingsChanged === true) {
        this.settingsChanged = false;
        this.pause();
        this.showWaveForm = 0;
        this.loadingText = 'Changing station';
        this.loading = true;
        this.loadPlaylist();
      }
    },
    initializeSettings() {
      let cookies = this.$cookies.keys();
      for (let i = 0; i < cookies.length; i++) {
        if (cookies[i].length > 8 && cookies[i].substring(0, 8) == 'setting_') {
          this.settings[cookies[i].substring(8)] = this.$cookies.get(cookies[i]);
        }
      }
    },
    getSetting(setting, defaultValue) {
      let value = this.$cookies.get('setting_' + setting) ?? defaultValue;
      return value;
    },
    updateSetting(event) {
      this.$cookies.set('setting_' + event.target.name, event.target.value);
      this.settings[event.target.name] = event.target.value;
    },
    updateYoutubePlayer() {
      if (this.currentTrack.youtube_id !== null) {
        this.$refs.plyr.player.source = {
          type: 'video',
          sources: [{
            src: this.currentTrack.youtube_id,
            provider: 'youtube',
          }],
        };
        this.play();
      }
    },
    loadPlaylist() {
      let CancelToken = axios.CancelToken;
      let source = CancelToken.source();
      this.axiosTokenSources.push(source);

      // console.log('Settings: %o', this.settings);

      axios({
        method: 'get',
        url: '/api/v1/track',
        params: {
          settings: this.settings,
          selectedType: this.selectedType,
          selectedId: this.selectedId,
        }
      }).then(response => { // handle success
        this.currentSeconds = response.data.current_seconds;
        this.currentTrack = response.data.current_track;
        this.previousTracks.length = 0;
        this.nextTracks.length = 0;
        response.data.previous_tracks.forEach((track) => {
          this.previousTracks.push(track);
        })
        response.data.next_tracks.forEach((track) => {
          this.nextTracks.push(track);
        })
        this.updateYoutubePlayer();
      })
      .catch(e => { // handle error
        if (!axios.isCancel(e)) {
          this.errors.push('Error while retrieving tracks. Message: ${e.message}');
        }
      })
      .then(() => { // always executed
        this.loading = false;
      })
    },
    getNextTrack() {
      if (this.nextTracks.length > 0) {
        this.previousTracks.unshift(this.currentTrack);
        this.currentTrack = this.nextTracks.shift();
        if (this.previousTracks.length > 5) {
          this.previousTracks.pop();
        }
        this.updateYoutubePlayer();
      } else {
        this.loadPlaylist();
      }
    },
    timeupdate() {
      let currentTimeRounded = Math.round(this.$refs.plyr.player.currentTime);
      if (this.currentTick != currentTimeRounded) {
        this.currentTick = currentTimeRounded;
        // console.log('Current tick: ' + this.currentTick);
        this.play();

        // Check if we need to stop the track.
        let stopTick = this.currentTrack.youtube_duration_ms ?? 0;
        let endMs = this.currentTrack.youtube_end_ms ?? this.currentTrack.youtube_duration_ms;
        let startMs = this.currentTrack.youtube_start_ms ?? 0;
        let extraMs = this.currentTrack.youtube_post_ms ?? 0;
        let destinationTick = (endMs - startMs + extraMs) / 1000;
        // console.log('Destination tick: ' + destinationTick);
        if (this.currentTick >= destinationTick) {
          // console.log('Getting next track');
          this.getNextTrack();
        }
      }
    },
    play() {
      if (this.startedRadio == 1 && this.$refs.plyr.player.paused == true) {
        // console.log('Playing');
        this.$refs.plyr.player.play();

        // Set the volume. Really quiet songs will have a little boost.
        if (this.currentTrack.loudness >= -30) {
          this.$refs.plyr.player.volume = this.baseVolume * 0.95;
        } else if (this.currentTrack.loudness >= -20) {
          this.$refs.plyr.player.volume = this.baseVolume * 0.9;
        } else {
          this.$refs.plyr.player.volume = this.baseVolume;
        }

        // Determine where we need to jump to.
        this.$refs.plyr.player.currentTime = (this.currentSeconds - this.currentTrack.secs_start);

        // Display the waveform.
        this.showWaveForm = 1;
        // console.log('Track', JSON.stringify(this.currentTrack, null, 2));
      }
    },
    pause() {
      // TODO: Check every 1 second if we're paused, and then auto-play.
    },
    clear() {
      this.tracks = [];
      this.cancel();
    },
    cancel() {
      this.axiosTokenSources.forEach((source) => {
        source.cancel();
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