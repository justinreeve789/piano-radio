<template>
  <div class="admin tags" :data-artist-id="currentTrack.artist_id" :data-album-id="currentTrack.album_id" :data-track-id="currentTrack.track_id">
    <h3>Artist</h3>
    <ul>
      <li v-for="tag in allTags" :class="{'active': arrayContains(currentTrack.artist_tags, tag)}">
        {{ tag }}
      </li>
    </ul>

    <h3>Album: {{ currentTrack.album_name }}</h3>
    <ul>
      <li v-for="tag in allTags" :class="{'active': arrayContains(currentTrack.album_tags, tag)}">
        {{ tag }}
      </li>
    </ul>

    <h3>Track</h3>
    <ul>
      <li v-for="tag in allTags" :class="{'active': arrayContains(currentTrack.track_tags, tag)}">
        {{ tag }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminPiano',
  props: {
    currentTrack: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      errors: [],
      allTags: [],
      artistTags: [],
      albumTags: [],
      trackTags: [],
    }
  },
  methods: {
    arrayContains(arr, item) {
      return Array.from(arr).indexOf(item) > -1;
    },
  },
  mounted: function() {
    axios({
      method: 'get',
      url: '/api/v1/tag',
    }).then(response => { // handle success
      response.data.tags.forEach((tag) => {
        this.allTags.push(tag);
      })
    }).catch(e => { // handle error
      if (!axios.isCancel(e)) {
        this.errors.push('Error while retrieving tags. Message: ${e.message}');
      }
    }).then(() => { // always executed
      this.loading = false;
    })
  },
  updated: function() {
  },
}
</script>