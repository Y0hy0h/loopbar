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
import { computed, defineComponent, ref } from 'vue'

import { timecodeFromSecond } from '../logic/time'

export default defineComponent({
  setup (props) {
    const videoFileInput = ref<HTMLInputElement>(null!)
    const player = ref<HTMLVideoElement>(null!)

    const currentSecond = ref(0)
    const currentTimeIndicator = computed(() => {
      return timecodeFromSecond(currentSecond.value)
    })

    return {
      videoFileInput,
      player,
      currentSecond,
      currentTimeIndicator
    }
  },
  methods: {
    seekToSecond (second: number) {
      this.currentSecond = second
      this.player.currentTime = this.currentSecond
    },
    play () {
      this.player.play()
    },
    pause () {
      this.player.pause()
    },
    videoFileSelected () {
      // Handle case where no file is present.
      const videoFile = this.videoFileInput.files?.[0]
      const fileUrl = URL.createObjectURL(videoFile)
      this.player.src = fileUrl
    },
    timeUpdated () {
      this.currentSecond = this.player.currentTime
    }
  }
})
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
