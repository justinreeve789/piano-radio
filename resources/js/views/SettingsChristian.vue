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

      <div class="preference-row settings-years">
        <label for="years">Release Year</label>
        <vue-range-slider
            ref="slider"
            v-model="years"
            :min="min_year"
            :max="max_year"
            :formatter="formatter"
            :enable-cross="false"
            :tooltip-merge="false"
            :tooltip-dir="'bottom'">
        </vue-range-slider>
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
  name: 'SettingsChristian',
  props: {
    settings: {
      type: Object,
      required: true,
      default() {
        return {
          formatter: null,
          genres: [
            'country',
            'gospel',
            'rock',
            'worship',
          ],
          mood: 0,
          years: [],
        };
      },
    },
  },
  data() {
    return {
      allgenres: [
        { label: 'country', value: 'country' },
        { label: 'gospel', value: 'gospel' },
        { label: 'rock', value: 'rock' },
        { label: 'worship', value: 'worship' },
      ],
      genres: [],
      max_year: 2021,
      min_year: 1960,
      mood: 0,
      page: 1,
      years: [],
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
    this.mood = this.$parent.getSetting('mood', 0);
    this.years = this.$parent.getSetting('years', [this.min_year, this.max_year]);
  },
  components: { VueRangeSlider },
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