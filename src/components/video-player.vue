<template>
  <video
    ref="player"
    :class="{ mirrored: mirrored }"
    :src="source"
    @click="togglePlay()"
    @playing="$emit('update:isPlaying', true)"
    @pause="$emit('update:isPlaying', false)"
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
    },
    mirrored: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'update:time-display',
    'update:isPlaying',
    'update:playbackRate'
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
    togglePlay () {
      if (this.player.paused || this.player.ended) {
        this.play()
      } else {
        this.player.pause()
      }
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
.mirrored {
  transform: scaleX(-100%)
}
</style>
