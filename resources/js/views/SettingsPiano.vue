<template>
  <div class="radio-container radio-settings">
    <div class="radio-contents">
      <div class="radio-options">
        <i class="fas fa-times close" @click="$parent.toggleSettings"></i>
      </div>

      <div class="preference-row">
        <label for="mood">Mood</label>
        <input name="mood" class="slider slider-stylistic" type="range" value="0" min="0" max="3" step="1" v-model="settingMood">
        <span class="value value-0">whatever</span>
        <span class="value value-1">soft</span>
        <span class="value value-2">neutral</span>
        <span class="value value-3">lively</span>
      </div>

      <div class="preference-row">
        <label for="mood">Style</label>
        <input name="style" class="slider slider-stylistic" type="range" value="0" min="0" max="3" step="1" v-model="settingStyle">
        <span class="value value-0">whatever</span>
        <span class="value value-1">solo</span>
        <span class="value value-2">duet</span>
        <span class="value value-3">instrumental</span>
      </div>

      <div class="preference-row">
        <label for="sacred">Play sacred music</label>
        <input name="sacred" class="slider slider-genre" type="range" value="1" min="0" max="2" step="1" v-model="settingSacred">
        <span class="value value-0">never</span>
        <span class="value value-1">sometimes</span>
        <span class="value value-2">always</span>
      </div>

      <div class="preference-row">
        <label for="christmas">Play Christmas music</label>
        <input name="christmas" class="slider slider-genre" type="range" value="1" min="0" max="2" step="1" v-model="settingChristmas">
        <span class="value value-0">never</span>
        <span class="value value-1">sometimes</span>
        <span class="value value-2">always</span>
      </div>

      <div class="preference-row">
        <label for="christmas">Play classical music</label>
        <input name="christmas" class="slider slider-genre" type="range" value="1" min="0" max="2" step="1" v-model="settingClassical">
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
    msg: String
  },
  data() {
    return {
      settingMood: 0,
      settingStyle: 0,
      settingChristmas: 1,
      settingSacred: 1,
      settingClassical: 1,
    }
  }
}
</script>