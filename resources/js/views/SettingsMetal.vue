<template>
  <div class="radio-container radio-settings" :data-settings-genre="genre">
    <div class="radio-contents">
      <div class="radio-options">
        <i class="fas fa-times close" @click="$parent.toggleSettings"></i>
      </div>

      <div class="preference-row settings-mood">
        <label for="genre">Genre</label>
        <input name="genre" class="slider slider-stylistic" type="range" min="0" max="3" step="1" v-model="genre" :data-value="genre" @input="$parent.updateSetting($event)">
        <span class="value value-0">whatever</span>
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
          genre: 0,
        };
      },
    },
  },
  data() {
    return {
      genre: this.$parent.getSetting('genre', 0),
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