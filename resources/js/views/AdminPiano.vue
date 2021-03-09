<template>
  <div>
    <h3>Mood: {{ currentTrack.mood }}</h3>
    <ul class="no-hashtag">
      <li>danceability: {{ currentTrack.danceability }}</li>
      <li>energy: {{ currentTrack.energy }}</li>
      <li>loudness: {{ currentTrack.loudness }}</li>
      <li>mode: {{ currentTrack.mode }}</li>
      <li>valence: {{ currentTrack.valence }}</li>
      <li>tempo: {{ currentTrack.tempo }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AdminPiano',
  props: {
    currentTrack: {
      type: Object,
      required: true,
    },
  },
}
</script>