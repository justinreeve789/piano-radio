<template>
  <div class="radio-container radio-settings" :data-settings-mood="mood" :data-settings-style="style" :data-settings-sacred="sacred" :data-settings-christmas="christmas" :data-settings-classical="classical">
    <div class="radio-contents">
      <div class="radio-options">
        <i class="fas fa-times close" @click="$parent.toggleSettings"></i>
      </div>

      <div class="preference-row settings-mood">
        <label for="mood">Mood</label>
        <input name="mood" class="slider slider-stylistic" type="range" min="0" max="3" step="1" v-model="mood" :data-value="mood" @input="$parent.updateSetting($event)">
        <span class="value value-0">whatever</span>
        <span class="value value-1">soft</span>
        <span class="value value-2">neutral</span>
        <span class="value value-3">lively</span>
      </div>

      <div class="preference-row settings-style">
        <label for="mood">Style</label>
        <input name="style" class="slider slider-stylistic" type="range" min="0" max="3" step="1" v-model="style" :data-value="style" @input="$parent.updateSetting($event)">
        <span class="value value-0">whatever</span>
        <span class="value value-1">solo</span>
        <span class="value value-2">duet</span>
        <span class="value value-3">instrumental</span>
      </div>

      <div :class="['preference-row', {'grey': christmas == 2 || classical == 2}]">
        <label for="sacred">Play sacred music</label>
        <input name="sacred" class="slider slider-genre" type="range" min="0" max="2" step="1" v-model="sacred" :data-value="sacred" @input="$parent.updateSetting($event)">
        <span class="value value-0">never</span>
        <span class="value value-1">sometimes</span>
        <span class="value value-2">always</span>
      </div>

      <div :class="['preference-row', {'grey': sacred == 2 || classical == 2}]">
        <label for="christmas">Play Christmas music</label>
        <input name="christmas" class="slider slider-genre" type="range" min="0" max="2" step="1" v-model="christmas" :data-value="christmas" @input="$parent.updateSetting($event)">
        <span class="value value-0">never</span>
        <span class="value value-1">sometimes</span>
        <span class="value value-2">always</span>
      </div>

      <div :class="['preference-row', {'grey': sacred == 2 || christmas == 2}]">
        <label for="classical">Play classical music</label>
        <input name="classical" class="slider slider-genre" type="range" min="0" max="2" step="1" v-model="classical" :data-value="classical" @input="$parent.updateSetting($event)">
        <span class="value value-0">never</span>
        <span class="value value-1">sometimes</span>
        <span class="value value-2">always</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsPiano',
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
      sacred: this.$parent.getSetting('sacred', 1),
      christmas: this.$parent.getSetting('christmas', 1),
      classical: this.$parent.getSetting('classical', 1),
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