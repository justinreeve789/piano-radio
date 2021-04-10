<template>
  <div class="radio-container radio-settings" :data-settings-genres="genres">
    <div :class="['radio-contents page page-1']">
      <div class="radio-options">
        <i class="fas fa-times close" @click="$parent.toggleSettings"></i>
      </div>

      <div class="preference-row settings-mood">
        <label for="mood">Mood</label>
        <input id="mood" name="mood" class="slider slider-stylistic" type="range" min="0" max="3" step="1" v-model="mood" :data-value="mood" @input="$parent.updateSetting($event)">
        <span class="value value-0">whatever</span>
        <span class="value value-1">smooth</span>
        <span class="value value-2">natural</span>
        <span class="value value-3">energetic</span>
      </div>
<!--
      <div class="preference-row settings-remixes">
        <label for="remixes">Remixes</label>
        <input id="remixes" name="remixes" class="slider slider-stylistic" type="range" min="0" max="2" step="1" v-model="remixes" :data-value="remixes" @input="$parent.updateSetting($event)">
        <span class="value value-0">never</span>
        <span class="value value-1">sometimes</span>
        <span class="value value-2">always</span>
      </div>

      <div class="preference-row settings-live">
        <label for="live">Live Performances</label>
        <input id="live" name="live" class="slider slider-stylistic" type="range" min="0" max="2" step="1" v-model="live" :data-value="live" @input="$parent.updateSetting($event)">
        <span class="value value-0">never</span>
        <span class="value value-1">sometimes</span>
        <span class="value value-2">always</span>
      </div>
-->
      <div class="preference-row years-mood">
        <label for="years">Release Year</label>
        <vue-slider v-model="years"></vue-slider>
      </div>
    </div>

    <div :class="['radio-contents page page-2']">
      <div class="preference-row">
        <label for="genres">Genres</label>
        <div class="genres">
          <div class="preference-row settings-genre" v-for="genre in allgenres">
            <label class="settings-checkbox">
              {{ genre.label }}
              <input :value="genre.value" v-model="genres" :data-value="genres[genre]" type="checkbox">
              <span class="checkmark"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsMetal',
  props: {
    settings: {
      type: Object,
      required: true,
      default() {
        return {
          formatter: null,
          genres: [
            'black',
            'christian',
            'death',
            'doom/stoner/sludge',
            'electronic/industrial',
            'experimental/avant-garde',
            'folk/viking/pagan',
            'gothic',
            'grindcore',
            'groove',
            'heavy',
            'metalcore/deathcore',
            'power',
            'progressive',
            'speed',
            'symphonic',
            'thrash',
          ],
          live: 1,
          mood: 0,
          remixes: 1,
          years: [1960, 2021],
        };
      },
    },
  },
  data() {
    return {
      allgenres: [
        { label: 'black', value: 'black' },
        { label: 'christian', value: 'christian' },
        { label: 'death', value: 'death' },
        { label: 'doom/stoner/sludge', value: 'doom' },
        { label: 'electronic/industrial', value: 'electronic' },
        { label: 'experimental/avant-garde', value: 'avantgarde' },
        { label: 'folk/viking/pagan', value: 'folk' },
        { label: 'gothic', value: 'gothic' },
        { label: 'grindcore', value: 'grindcore' },
        { label: 'groove', value: 'groove' },
        { label: 'heavy', value: 'heavy' },
        { label: 'metalcore/deathcore', value: 'metalcore' },
        { label: 'power', value: 'power' },
        { label: 'progressive', value: 'progressive' },
        { label: 'speed', value: 'speed' },
        { label: 'symphonic', value: 'orchestral' },
        { label: 'thrash', value: 'thrash' },
      ],
      genres: [],
      max_year: 2021,
      min_year: 1960,
      mood: 0,
      page: 1,
      years: this.$parent.getSetting('years'),
    }
  },
  created() {
    let currentYear = new Date().getFullYear();
    this.formatter = years => `${years}`;
    let defaultgenres = [];
    for (let i = 0; i < this.allgenres.length; i++) {
      defaultgenres.push(this.allgenres[i].value);
    }
    this.genres = this.$parent.getSetting('genres', defaultgenres);
    // this.live = this.$parent.getSetting('live', 1);
    // this.max_year = currentYear;
    // this.min_year = 1960;
    this.mood = this.$parent.getSetting('mood', 0);
    // this.remixes = this.$parent.getSetting('remixes', 1);
    // this.years = [currentYear - 15, currentYear];
  },
  components: { 'vue-slider': window['vue-slider-component'] },
  computed: {
    settingValue: function(setting) {
      return settings[setting];
    }
  },
  updated: function() {
    this.$parent.settingsChanged = true;
  },
  watch: {
    genres: function(value) {
      this.$parent.updateSettingByKey('genres', value);
    },
    years: function(value) {
      this.$parent.updateSettingByKey('years', value);
    },
  }
}
</script>