<template>
  <VideoPlayer ref="player"></VideoPlayer>
  <div class="loopArea">
    <NumberInput v-model="range.start">Start</NumberInput>
    <NumberInput v-model="range.duration">Duration</NumberInput>
    <NumberInput v-model="range.end">End</NumberInput>
    <button @click="toggleLoop()">Toggle looping</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue'

import VideoPlayer from '@/components/video-player.vue'
import NumberInput from '@/components/number-input.vue'

import { Range } from '../logic/range'

export default defineComponent({
  components: {
    VideoPlayer,
    NumberInput
  },
  setup () {
    const player = ref<typeof VideoPlayer>(null!)

    const range = reactive(new Range(0, 1))
    watch(range, (newValue) => console.log(newValue))
    const intervallId = ref<number | null>(null)

    return {
      player,
      range,
      intervallId
    }
  },
  methods: {
    toggleLoop () {
      if (this.intervallId == null) {
        this.startLoop()
      } else {
        this.stopLoop()
      }
    },
    startLoop () {
      this.$_playLoopStart()
      const durationInMilliseconds = this.range.duration * 1000
      this.intervallId = setInterval(
        () => this.$_playLoopStart(),
        durationInMilliseconds
      )
    },
    stopLoop () {
      if (this.intervallId != null) {
        clearInterval(this.intervallId)
        this.intervallId = null
      }
    },
    $_playLoopStart () {
      this.player.seekToSecond(this.range.start)
      this.player.play()
    },
    $_pause () {
      this.player.pause()
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
