<template>
  <div class="radio-container radio-settings" :data-settings-mood="mood" :data-settings-style="style">
    <div class="radio-contents">
      <div class="radio-options">
        <i class="fas fa-times close" @click="$parent.toggleSettings"></i>
      </div>

      <div class="preference-row settings-mood">
        <label for="mood">Mood</label>
        <input name="mood" class="slider slider-stylistic" type="range" min="0" max="3" step="1" v-model="mood" :data-value="mood" @input="$parent.updateSetting($event)">
        <span class="value value-0">whatever</span>
        <span class="value value-1">soft</span>
        <span class="value value-2">natural</span>
        <span class="value value-3">lively</span>
      </div>

      <div class="preference-row settings-style">
        <label for="mood">Style</label>
        <input name="style" class="slider slider-stylistic" type="range" min="0" max="2" step="1" v-model="style" :data-value="style" @input="$parent.updateSetting($event)">
        <span class="value value-0">whatever</span>
        <span class="value value-1">solo</span>
        <span class="value value-2">instrumental</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsChristmasPiano',
  props: {
    settings: {
      type: Object,
      required: true,
      default() {
        return {
          mood: 0,
          style: 0,
          sacred: 1,
          christmas: 1,
          classical: 1,
        };
      },
    },
  },
  data() {
    return {
      mood: this.$parent.getSetting('mood', 0),
      style: this.$parent.getSetting('style', 0),
    }
  },
  computed: {
    settingValue: function(setting) {
      return settings[setting];
    }
  },
  updated: function() {
    this.$parent.settingsChanged = true;
  }
}
</script>