<template>
  <div class="radio-container radio-settings" :data-settings-genres="genres">
    <div class="radio-contents">
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
          genres: [],
          years: [1960, 2021],
        };
      },
    },
  },
  data() {
    return {
      allgenres: [
        'black',
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
      genres: JSON.parse(this.$parent.getSetting('genres', '')),
      max_year: 2021,
      min_year: 1960,
      mood: this.$parent.getSetting('mood', 0),
      years: this.$parent.getSetting('years', [1960, 2021]),
    }
  },
  created() {
    this.formatter = years => `${years}`;
    this.max_year = 2021;
    this.min_year = 1960;
    this.allgenres.forEach(function(item, index, arr) {
      this.genres[item] = $this.parent.getSetting('genre')
    });
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
      this.$parent.updateSettingByKey('years', value);
    },
  }
}
</script>