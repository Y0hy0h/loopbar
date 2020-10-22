<template>
  <VideoPlayer ref="player" @updated-time="currentTime = $event" @paused="videoPaused"></VideoPlayer>
  <span class="currentTime">Beat #{{bar}} ({{currentTimeIndicator}})</span>
  <div class="loop-area">
    <NumberInput v-model="range.start">Start</NumberInput>
    <NumberInput v-model="range.duration">Duration</NumberInput>
    <NumberInput v-model="range.end">End</NumberInput>
    <button @click="toggleLoop()">Toggle looping</button>
  </div>
  <BeatSettings :currentTime="currentTime" @updated-period="period = $event" @updated-offset="offset = $event"></BeatSettings>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue'

import VideoPlayer from '@/components/video-player.vue'
import BeatSettings from '@/components/beat-settings.vue'
import NumberInput from '@/components/number-input.vue'

import { Range } from '@/logic/range'
import { timecodeFromSecond } from '@/logic/time'

export default defineComponent({
  components: {
    VideoPlayer,
    NumberInput,
    BeatSettings
  },
  setup () {
    const player = ref<typeof VideoPlayer>(null!)
    const currentTime = ref(0)
    const currentTimeIndicator = computed(() => {
      return timecodeFromSecond(currentTime.value)
    })

    const period = ref(0)
    const offset = ref(0)
    const bar = computed(() => {
      if (period.value > 0) {
        const offsetSeconds = offset.value * period.value
        return Math.floor((currentTime.value - offsetSeconds) / period.value)
      } else {
        return 0
      }
    })

    const range = reactive(new Range(0, 1))
    const intervallId = ref<number | null>(null)

    return {
      player,
      currentTime,
      currentTimeIndicator,
      period,
      offset,
      bar,
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
    videoPaused () {
      this.stopLoop()
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

.loop-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

  .currentTime {
    font-family: monospace;
    font-size: 2rem;
  }
</style>
