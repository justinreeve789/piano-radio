<template>
  <div class="radio-container radio-settings" :data-settings-mood="settings.mood" :data-settings-style="settings.style" :data-settings-sacred="settings.sacred" :data-settings-christmas="settings.christmas" :data-settings-classical="settings.classical">
    <div class="radio-contents">
      <div class="radio-options">
        <i class="fas fa-times close" @click="$parent.toggleSettings"></i>
      </div>

      <div class="preference-row">
        <label for="mood">Mood</label>
        <input name="mood" class="slider slider-stylistic" type="range" min="0" max="3" step="1" v-model="settings.mood" @input="$parent.updateSetting($event)">
        <span class="value value-0">whatever</span>
        <span class="value value-1">soft</span>
        <span class="value value-2">neutral</span>
        <span class="value value-3">lively</span>
      </div>

      <div class="preference-row">
        <label for="mood">Style</label>
        <input name="style" class="slider slider-stylistic" type="range" min="0" max="3" step="1" v-model="settings.style" @input="$parent.updateSetting($event)">
        <span class="value value-0">whatever</span>
        <span class="value value-1">solo</span>
        <span class="value value-2">duet</span>
        <span class="value value-3">instrumental</span>
      </div>

      <div class="preference-row">
        <label for="sacred">Play sacred music</label>
        <input name="sacred" class="slider slider-genre" type="range" min="0" max="2" step="1" v-model="settings.sacred" @input="$parent.updateSetting($event)">
        <span class="value value-0">never</span>
        <span class="value value-1">sometimes</span>
        <span class="value value-2">always</span>
      </div>

      <div class="preference-row">
        <label for="christmas">Play Christmas music</label>
        <input name="christmas" class="slider slider-genre" type="range" min="0" max="2" step="1" v-model="settings.christmas" @input="$parent.updateSetting($event)">
        <span class="value value-0">never</span>
        <span class="value value-1">sometimes</span>
        <span class="value value-2">always</span>
      </div>

      <div class="preference-row">
        <label for="christmas">Play classical music</label>
        <input name="christmas" class="slider slider-genre" type="range" min="0" max="2" step="1" v-model="settings.classical" @input="$parent.updateSetting($event)">
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
    }
  },
  created() {
    console.log(this.settings);
  },
}
</script>