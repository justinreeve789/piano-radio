<template>
  <div class="track-row track-current">
    <img class="track-image" src="https://i.scdn.co/image/ab67616d0000b2738fabf7739b7663ab21536bf9" alt="" />
    <div class="track-details">
      <span class="track-name">Don't Stop Believing</span>
      <span>by</span>
      <span class="track-artist">
              <a href="#">Jarrod Radnich</a>
      </span>
    </div>
    <div class="track-visualization">
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
</template>

<script>
import axios from 'axios';
const nextTrackUrl = '/api/v1/track/next';
export default {
  data () {
    return {
      tracks: [],
      errors: [],
      axiosTokenSources: []
    }
  },
}
</script>