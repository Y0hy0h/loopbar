<template>
  <video ref="player" id="player" :src="source" controls @playing="$emit('started-playing')" @pause="$emit('paused')"></video>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  props: {
    file: {
      type: File
    }
  },
  emits: [
    'updated-time-display',
    'started-playing',
    'paused'
  ],
  setup (props, ctx) {
    const player = ref<HTMLVideoElement>(null!)

    const source = computed(() => {
      if (props.file != null) {
        const fileUrl = URL.createObjectURL(props.file)
        return fileUrl
      } else {
        return null
      }
    })

    let lastCurrentTime: DOMHighResTimeStamp | null = null
    const updateCurrentTime = () => {
      const newTime = player.value.currentTime
      if (lastCurrentTime !== newTime) {
        lastCurrentTime = newTime
        ctx.emit('updated-time-display', newTime)
      }
      requestAnimationFrame(updateCurrentTime)
    }
    onMounted(updateCurrentTime)

    return {
      player,
      source,
    }
  },
  methods: {
    getCurrentTime () {
      return this.player.currentTime
    },
    seekToSecond (second: number) {
      this.player.currentTime = second
    },
    play () {
      this.player.play()
    },
    pause () {
      this.player.pause()
    },
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
