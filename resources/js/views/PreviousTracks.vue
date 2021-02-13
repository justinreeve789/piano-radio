<template>
  <div>
    <h2>Previously Played</h2>
    <div class="track-row track-other previous" v-for="track in previousTracks">
      <img class="track-image" :src="track.artist_image_url" alt="" />
      <div class="track-details">
        <span class="track-name">{{ track.track_name }}</span>
        <span>by</span>
        <span class="track-artist">
        <a :href="track.artist_url">{{ track.artist_name }}</a>
      </span>
      </div>
    </div>
  </div>
</template>