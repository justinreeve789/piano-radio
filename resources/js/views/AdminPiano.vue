<template>
  <div class="admin tags">
    <h3>Artist</h3>
    <ul>
      <li v-for="tag in allTags" :class="{'active': arrayContains(artistTags, tag)}">
        {{ tag }}
      </li>
    </ul>

    <h3>Album</h3>
    <ul>
      <li v-for="tag in allTags" :class="{'active': arrayContains(albumTags, tag)}">
        {{ tag }}
      </li>
    </ul>

    <h3>Track</h3>
    <ul>
      <li v-for="tag in allTags" :class="{'active': arrayContains(trackTags, tag)}">
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
      console.log(JSON.stringify(arr));
      console.log('Searching array for ' + item + ' %o', Array.from(arr));
      return arr.contains(item);
    }
  },
  mounted: function() {
    console.log('track_id: %o', this.currentTrack.track_id);

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