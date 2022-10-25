<template>
  <div class="admin tags" :data-artist-id="currentTrack.artist_id" :data-album-id="currentTrack.album_id" :data-track-id="currentTrack.track_id">
<!--    <component :is="adminComponent" :currentTrack="currentTrack"></component>-->

    <h3>Artist: {{ currentTrack.artist_id }} <span id="artist-usability" class="toggle-usability" @click="toggleUsability('artist', currentTrack.artist_id)">Toggle Usability</span></h3>
    <ul>
      <li v-for="tag in allTags" :class="{'active': arrayContains(currentTrack.artist_tags, tag)}" @click="toggleTag('artist', tag)">
        {{ tag }}
      </li>
    </ul>

    <h3>Album: {{ currentTrack.album_id }} {{ currentTrack.album_name }} <span id="album-usability" class="toggle-usability" @click="toggleUsability('album', currentTrack.album_id)">Toggle Usability</span></h3>
    <ul>
      <li v-for="tag in allTags" :class="{'active': arrayContains(currentTrack.album_tags, tag)}" @click="toggleTag('album', tag)">
        {{ tag }}
      </li>
    </ul>

    <h3>Track: {{ currentTrack.track_id }} <span id="track-usability" class="toggle-usability" @click="toggleUsability('track', currentTrack.track_id)">Toggle Usability</span></h3>
    <ul>
      <li v-for="tag in allTags" :class="{'active': arrayContains(currentTrack.track_tags, tag)}" @click="toggleTag('track', tag)">
        {{ tag }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';
import AdminPiano from './AdminPiano.vue';

export default {
  name: 'Admin',
  props: {
    currentTrack: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      errors: [],
      adminComponent: adminComponent,
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
    toggleUsability(type, id) {
        axios({
          method: 'post',
          url: '/api/v1/' + type + '/usable',
          params: { id: id },
        }).then(response => { // handle success
            alert('Usability toggled.');
        });
    },
    toggleTag(type, tag) {
      let tag_arr = type + '_tags';
      let id_field = type + '_id';
      let index = Array.from(this.currentTrack[tag_arr]).indexOf(tag);
      if (index > -1) {
        axios({
          method: 'delete',
          url: '/api/v1/' + type + '/tag',
          params: { id: this.currentTrack[id_field], tag: tag },
        }).then(response => { // handle success
          this.currentTrack[tag_arr].splice(index, 1);
        });
      } else {
        axios({
          method: 'post',
          url: '/api/v1/' + type + '/tag',
          params: { id: this.currentTrack[id_field], tag: tag },
        }).then(response => { // handle success
          this.currentTrack[tag_arr].push(tag);
        });
      }
    }
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