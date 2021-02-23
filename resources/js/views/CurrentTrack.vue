<template>
  <div id="track-playing">
    <div class="track-row track-current">
      <img class="track-image" :src="image" alt="" />
      <div class="track-details">
        <span class="track-name">{{ track }}</span>
        <span>by</span>
        <span class="track-artist">
          <a :href="url">{{ artist }}</a>
        </span>
      </div>
      <div class="track-visualization" v-show="showWaveForm">
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showWaveForm: 1,
    }
  },
  props: {
    track: '',
    artist: '',
    image: '',
    url: '',
  },
}
</script>