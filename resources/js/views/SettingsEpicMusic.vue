<template>
  <div class="radio-container radio-settings" :data-settings-mood="mood">
    <div class="radio-contents">
      <div class="radio-options">
        <i class="fas fa-times close" @click="$parent.toggleSettings"></i>
      </div>

      <div class="preference-row settings-mood">
        <label for="mood">Epicness</label>
        <input name="mood" class="slider slider-stylistic" type="range" min="0" max="3" step="1" v-model="mood" :data-value="mood" @input="$parent.updateSetting($event)">
        <span class="value value-0">whatever</span>
        <span class="value value-1">mild</span>
        <span class="value value-2">moderate</span>
        <span class="value value-3">maximum</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsEpicMusic',
  props: {
    settings: {
      type: Object,
      required: true,
      default() {
        return {
          mood: 0,
        };
      },
    },
  },
  data() {
    return {
      mood: this.$parent.getSetting('mood', 0),
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