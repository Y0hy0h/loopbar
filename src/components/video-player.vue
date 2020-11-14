<template>
  <video
    ref="player"
    id="player"
    :src="source"
    controls
    @playing="$emit('started-playing')"
    @pause="$emit('paused')"
    @ratechange="rateChanged()"
  ></video>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, toRef, watch } from 'vue'

export default defineComponent({
  props: {
    file: {
      type: File
    },
    playbackRate: {
      type: Number,
      default: 1
    }
  },
  emits: [
    'update:time-display',
    'update:playbackRate',
    'started-playing',
    'paused'
  ],
  setup (props, ctx) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const player = ref<HTMLVideoElement>(null!)

    const source = computed(() => {
      if (props.file != null) {
        const fileUrl = URL.createObjectURL(props.file)
        return fileUrl
      } else {
        return null
      }
    })

    watch(toRef(props, 'playbackRate'), (newRate) => {
      player.value.playbackRate = newRate
    })

    let lastCurrentTime: DOMHighResTimeStamp | null = null
    const updateCurrentTime = () => {
      const newTime = player.value?.currentTime
      if (newTime !== null && lastCurrentTime !== newTime) {
        lastCurrentTime = newTime
        ctx.emit('update:time-display', newTime)
      }
      requestAnimationFrame(updateCurrentTime)
    }
    onMounted(updateCurrentTime)

    return {
      player,
      source
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
    rateChanged () {
      const newRate = this.player.playbackRate
      this.$emit('update:playbackRate', newRate)
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
