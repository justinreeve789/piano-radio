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
                  <i class="fas fa-minus hidebox" @click="collapsedInfoBox = 1"></i>
                  <i class="fas fa-cog settings" @click="toggleSettings" v-if="!selectedType"></i>
                </div>
                <CurrentTrack v-if="Object.keys(currentTrack).length !== 0" :track="currentTrack.track_name" :artist="currentTrack.artist_name" :image="currentTrack.artist_image_url" :url="currentTrack.artist_url"></CurrentTrack>
                <Admin v-if="isAdmin == 1 && Object.keys(currentTrack).length !== 0" :currentTrack="currentTrack"></Admin>
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
<!--          <SoundCloud ref="soundcloud" :soundcloud_id="currentTrack.soundcloud_id"></SoundCloud>-->
          <SoundCloud ref="soundcloud_player" :track="currentTrack.soundcloud_id" :mini="false" @ready="ready" v-if="sourceType == 'soundcloud'" />
          <vue-plyr ref="plyr" v-show="sourceType == 'youtube'">
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
import SoundCloud from 'vue-soundcloud-player';
import VueCookies from 'vue-cookies';
import CurrentTrack from './CurrentTrack.vue';
import PreviousTracks from './PreviousTracks.vue';
import SettingsChristian from './SettingsChristian.vue';
import SettingsChristmasPiano from './SettingsChristmasPiano.vue';
import SettingsEpicMusic from './SettingsEpicMusic.vue';
import SettingsMetal from './SettingsMetal.vue';
import SettingsPiano from './SettingsPiano.vue';
import Admin from './Admin.vue';
import AdminPiano from './AdminPiano.vue';
import AdminChristmasPiano from './AdminChristmasPiano.vue';
import { RadioStation } from '../radio/station.mjs';

const STATUS_TEXT = {
  'loading': 'Loading station',
  'loading-track': 'Loading track',
  'buffering': 'Buffering',
  'error': 'Couldn\'t reach the station. Retrying…',
  'empty': 'Nothing is scheduled right now. Retrying…',
  'unavailable': 'This track is unavailable. The next one starts on schedule.',
};

export default {
  name: 'App',
  components: { SoundCloud, CurrentTrack, PreviousTracks, SettingsChristian, SettingsChristmasPiano, SettingsEpicMusic, SettingsMetal, SettingsPiano, Admin, AdminPiano, AdminChristmasPiano },
  data() {
    return {
      selectedType: selectedType,
      selectedId: selectedId,
      nextTracks: [],
      previousTracks: [],
      currentSeconds: 0,
      baseVolume: 1.0,
      currentTrack: {},
      errors: [],
      isAdmin: allowAdmin,
      startedRadio: false,
      showWaveForm: true,
      collapsedInfoBox: false,
      flippedInfoBox: false,
      loading: false,
      loadingText: '',
      sourceType: '',
      adminComponent: adminComponent,
      settingsComponent: settingsComponent,
      isMobile: isMobile,
      settingsChanged: false,
      settings: {},
      waitingForMusic: false,
    };
  },
  created() {
    this.initializeSettings();
  },
  mounted() {
    const plyr = this.$refs.plyr.player;

    // The station decides what plays and when (see resources/js/radio/station.mjs); this
    // component only connects it to Plyr and the API.
    this.station = new RadioStation({
      player: {
        load: (videoId) => {
          this.sourceType = 'youtube';
          plyr.source = {
            type: 'video',
            sources: [{ src: videoId, provider: 'youtube' }],
          };
        },
        play: () => plyr.play(),
        pause: () => plyr.pause(),
        seek: (position) => {
          try {
            plyr.currentTime = position;
          } catch (e) {
            // Not ready yet; the station seeks again once it is.
          }
        },
        currentTime: () => plyr.currentTime || 0,
        isPaused: () => plyr.paused,
        setVolume: (volume) => { plyr.volume = volume; },
      },
      fetchSchedule: () => this.fetchSchedule(),
      reportFailure: (track) => this.reportFailure(track),
      onChange: (state) => this.stationChanged(state),
      options: { baseVolume: this.baseVolume },
    });

    plyr.on('ready', () => this.station.onReady());
    plyr.on('canplay', () => this.station.onReady());
    plyr.on('timeupdate', () => this.station.onTimeUpdate());
    plyr.on('ended', () => this.station.onEnded());
    plyr.on('error', () => {
      const error = plyr.media && plyr.media.error;
      this.station.onError(error ? error.code : null);
    });

    if (this.isAdmin != 1) {
      this.isAdmin = this.$cookies.get('admin');
    }
  },
  beforeDestroy() {
    if (this.station) {
      this.station.stop();
    }
  },
  methods: {
    startRadio() {
      this.startedRadio = 1;
      if (this.station.started) {
        // Autoplay was blocked; this click lets the browser play.
        this.station.resume();
        return;
      }
      this.waitingForMusic = true;
      this.loadingText = STATUS_TEXT['loading'];
      this.loading = true;
      this.station.start();
    },
    toggleSettings() {
      this.flippedInfoBox = !this.flippedInfoBox;

      if (this.settingsChanged === true && !this.flippedInfoBox) {
        this.settingsChanged = false;
        this.showWaveForm = 0;
        this.waitingForMusic = true;
        this.loadingText = 'Changing station';
        this.loading = true;
        this.station.refresh();
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
      let value = this.$cookies.get('setting_' + setting);
      if (typeof value == 'undefined' || value == null) {
        return defaultValue;
      }
      return JSON.parse(value);
    },
    updateSetting(event) {
      let value = event.target.value;
      this.$cookies.set('setting_' + event.target.name, JSON.stringify(value));
      this.settings[event.target.name] = value;
    },
    updateSettingByKey(key, value) {
      this.$cookies.set('setting_' + key, JSON.stringify(value));
      this.settings[key] = value;
    },
    ready() {
      this.$refs.soundcloud_player.soundcloud.play();
    },
    fetchSchedule() {
      let params = {};
      if (this.selectedType == 'artist' || this.selectedType == 'album') {
        params = { selectedType: this.selectedType, selectedId: this.selectedId };
      } else {
        params = { settings: this.settings };
      }
      return axios({
        method: 'get',
        url: '/api/v1/track',
        params: params,
      }).then(response => response.data)
        .catch(e => {
          this.errors.push(`Error while retrieving tracks. Message: ${e.message}`);
          throw e;
        });
    },
    reportFailure(track) {
      axios({
        method: 'delete',
        url: '/api/v1/tracksource',
        params: { youtube_id: track.youtube_id },
      }).catch(() => {});
    },
    stationChanged(state) {
      this.currentTrack = state.currentTrack || {};
      this.nextTracks = state.nextTracks;
      this.previousTracks = state.previousTracks;
      const now = this.station ? this.station.now() : null;
      if (now !== null) {
        this.currentSeconds = now;
      }

      if (state.status === 'playing') {
        this.waitingForMusic = false;
        this.loading = false;
        this.showWaveForm = 1;
      } else if (state.status === 'blocked') {
        // Show the play button again so the listener can start playback.
        this.startedRadio = false;
        this.loading = false;
      } else if (STATUS_TEXT[state.status] && (this.waitingForMusic || state.status === 'unavailable' || state.status === 'error')) {
        this.loadingText = STATUS_TEXT[state.status];
        this.loading = state.status !== 'unavailable';
      }
    },
  },
};
</script>
