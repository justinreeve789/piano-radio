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

      <div class="preference-row years-mood">
        <label for="years">Release Year</label>
        <vue-range-slider
            ref="slider"
            v-model="years"
            :min="min_year"
            :max="max_year"
            :formatter="formatter"
            :enableCross="false"
            :tooltipMerge="false">
        </vue-range-slider>
      </div>
    </div>

    <div :class="['radio-contents page page-2']">
      <div class="preference-row">
        <label for="genres">Genres</label>
        <div class="genres">
          <div class="preference-row settings-genre" v-for="genre in allgenres">
            <label class="settings-checkbox">
              {{ genre }}
              <input name="genres[]" :value="genre" v-model="genres" :data-value="genres[genre]" type="checkbox" checked="checked">
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
          years: [],
        };
      },
    },
  },
  data() {
    return {
      allgenres: [
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
      genres: this.$parent.getSetting('genres', ['heavy']),
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
    this.genres = this.$parent.getSetting('genres');
    this.live = this.$parent.getSetting('live', 1);
    this.max_year = currentYear;
    this.min_year = 1960;
    this.mood = this.$parent.getSetting('mood', 0);
    this.remixes = this.$parent.getSetting('remixes', 1);
    this.years = [currentYear - 15, currentYear];
    // this.allgenres.forEach(function(item, index, arr) {
    //   this.genres[item] = $this.parent.getSetting('genres')
    // });
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
      this.$parent.updateSettingByKey('genres', JSON.stringify(value));
    },
    years: function(value) {
      console.log(value);
      this.$parent.updateSettingByKey('years', JSON.stringify(value));
    },
  }
}
</script>