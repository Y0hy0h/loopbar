<template>
  <div class="videoArea">
    <label>
      Choose a video file
      <input ref="videoFileInput" type="file" accept="video/*" @change="videoFileSelected"/>
    </label>
    <video ref="player" id="player" controls @timeupdate="timeUpdated"></video>
    <span class="currentTime">{{currentTimeIndicator}}</span>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

import { timecodeFromSecond } from '../logic/time'

@Options({
})
export default class Home extends Vue {
  currentSecond = 0;
  get currentTimeIndicator(): string {
    return timecodeFromSecond(this.currentSecond)
  }

  $refs!: {
    videoFileInput: HTMLInputElement,
    player: HTMLVideoElement,
  }

  videoFileSelected () {
    // Handle case where no file is present.
    const videoFile = this.$refs.videoFileInput.files?.[0];
    const fileUrl = URL.createObjectURL(videoFile);
    this.$refs.player.src = fileUrl;
  }

  timeUpdated () {
    this.currentSecond = this.$refs.player.currentTime;
  }
}
</script>

<style>
  label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .videoArea {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  #player {
    max-width: 100%;
    max-height: 50vh;
  }

  .currentTime {
    font-family: monospace;
    font-size: 2rem;
  }
</style>