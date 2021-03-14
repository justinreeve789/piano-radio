<template>
  <div class="soundcloud-player" style="height: 100%;">
    <iframe
        id="sc-widget"
        width="100%"
        height="100%"
        scrolling="no"
        frameborder="no"
        :key="'soundcloud-iframe-' + $parent.currentTrack.soundcloud_id"
        :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + $parent.currentTrack.soundcloud_id + '&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=true&visual=true'">
    </iframe>
  </div>
</template>

<script>
export default {
  name: 'SoundCloud',
  data() {
    return {
    }
  },
  mounted() {
    const widget = SC.Widget(document.getElementById('sc-widget'));
    let time_ms = 0;
    if (this.$parent.currentSeconds > this.$parent.currentTrack.secs_start) {
      time_ms = (this.$parent.currentSeconds - this.$parent.currentTrack.secs_start) * 1000;
    }
    widget.bind(SC.Widget.Events.READY, function() {
      widget.play();
      widget.seekTo(time_ms);
    });
  },
}
</script>