<template>
  <div class="container">
    <div class="video-area">
      <VideoPlayer ref="player" @updated-time="currentTime = $event" @paused="videoPaused"></VideoPlayer>
      <span class="currentTime">
        <span v-if="!beatMeter.needsMoreBeats">
          Beat #{{bar}}
        </span>
        <span v-else class="missing-beats">
          Set bpm below.
        </span>
        ({{currentTimeIndicator}})
      </span>
    </div>
    <div class="loop-area">
      <button @click="toggleLoop()">{{loopButtonText}}</button>
      <div class="loop-settings">
        <NumberInput v-model="range.start">Start</NumberInput>
        <NumberInput v-model="range.duration">Duration</NumberInput>
        <NumberInput v-model="range.end">End</NumberInput>
      </div>
    </div>
    <BeatSettings ref="beatSettings" :currentTime="currentTime" v-model:beatMeter="beatMeter" @start-play="player.play()"></BeatSettings>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue'

import VideoPlayer from '@/components/video-player.vue'
import BeatSettings from '@/components/beat-settings.vue'
import NumberInput from '@/components/number-input.vue'

import { Range } from '@/logic/range'
import { timecodeFromSecond } from '@/logic/time'
import { BeatMeter } from '@/logic/beatMeter'

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

    const beatMeter = reactive(new BeatMeter())

    const bar = computed(() => {
      if (beatMeter.period > 0) {
        const offsetSeconds = beatMeter.offset * beatMeter.period
        return Math.floor((currentTime.value - offsetSeconds) / beatMeter.period)
      } else {
        return 0
      }
    })

    const range = reactive(new Range(0, 1))
    const intervallId = ref<number | null>(null)
    const isLooping = computed(() => {
      return intervallId.value != null
    })
    const loopButtonText = computed(() => {
      if (!isLooping.value) {
        return "Start loop"
      } else {
        return "Stop loop"
      }
    })

    return {
      player,
      currentTime,
      currentTimeIndicator,
      beatMeter,
      bar,
      range,
      intervallId,
      loopButtonText
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

<style scoped lang="scss">
.container {
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2rem;
}

.video-area {
 display: flex;
 flex-direction: column;
 align-items: flex-start;
 gap: 0.5rem;
}

.currentTime {
  font-family: monospace;
  font-size: 1.2rem;
}

.loop-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.loop-settings {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;

  * {
    flex: 1;
  }
}

.missing-beats {
  font-style: italic;
}
</style>
