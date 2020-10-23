<template>
  <div class="video-container">
    <label>
      Choose a video file
      <input ref="videoFileInput" type="file" accept="video/*" @change="videoFileSelected"/>
    </label>
    <video ref="player" id="player" controls @playing="$emit('started-playing')" @pause="$emit('paused')"></video>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  emits: [
    'updated-time',
    'started-playing',
    'paused'
  ],
  setup (props, ctx) {
    const videoFileInput = ref<HTMLInputElement>(null!)
    const player = ref<HTMLVideoElement>(null!)

    const currentTime = ref(0)
    const updateCurrentTime = () => {
      currentTime.value = player.value.currentTime
      ctx.emit('updated-time', currentTime.value)
      requestAnimationFrame(updateCurrentTime)
    }
    onMounted(updateCurrentTime)

    return {
      videoFileInput,
      player,
      currentTime
    }
  },
  methods: {
    seekToSecond (second: number) {
      this.player.currentTime = second
    },
    play () {
      this.player.play()
    },
    pause () {
      this.player.pause()
    },
    videoFileSelected () {
      // TODO: Handle case where no file is present.
      const videoFile = this.videoFileInput.files?.[0]
      const fileUrl = URL.createObjectURL(videoFile)
      this.player.src = fileUrl
    }
  }
})
</script>

<style scoped>
  label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .video-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  #player {
    max-width: 100%;
  }
</style>
