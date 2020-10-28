<template>
  <div class="root-container">
    <label>
      Choose a video file
      <input ref="videoFileInput" type="file" accept="video/*" @change="videoFileSelected"/>
    </label>
    <div class="control-container" v-if="videoFile !== null">
      <div class="video-area">
        <VideoPlayer ref="player" :file="videoFile" @update:time-display="currentTimeDisplay = $event" @paused="videoPaused" v-model:playbackRate="playbackRate"></VideoPlayer>
        <span class="currentTime">
          Beat #{{bar}} ({{currentTimeIndicator}})
        </span>
        <div class="rate-settings">
          <SliderInput class="rate-slider" v-model="playbackRatePercent" :min="25" :max="300">
            Playback rate
            <template v-slot:unit> %</template>
          </SliderInput>
          <div class="rate-buttons">
            <button @click="playbackRate = 0.25">25 %</button>
            <button @click="playbackRate = 0.5">50 %</button>
            <button @click="playbackRate = 0.75">75 %</button>
            <button @click="playbackRate = 1">100 %</button>
            <button @click="playbackRate = 1.5">150 %</button>
            <button @click="playbackRate = 2">200 %</button>
          </div>
        </div>
      </div>
      <div class="loop-area">
        <button @click="toggleLoop()">{{loopButtonText}}</button>
        <div class="loop-settings">
          <div class="input-with-button">
            <NumberInput v-model="range.start" class="narrow-input">from</NumberInput>
            <button @click="loopStartToNowClicked()">set to now</button>
          </div>
          <NumberInput v-model="range.duration" class="narrow-input">for duration</NumberInput>
          <div class="input-with-button">
            <NumberInput v-model="range.end" class="narrow-input">to</NumberInput>
            <button @click="loopEndToNowClicked()">set to now</button>
          </div>
        </div>
      </div>
      <BeatSettings class="beat-settings" :currentTimeDisplay="currentTimeDisplay" :getCurrentTime="getCurrentTime" :customBpm="customBpm" :customOffset="customOffset" @update:bpm="bpm = $event" @update:offset="offset = $event" @start-play="player.play()"></BeatSettings>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, Ref, ref, watch } from 'vue'

import VideoPlayer from '@/components/video-player.vue'
import BeatSettings from '@/components/beat-settings.vue'
import NumberInput from '@/components/number-input.vue'
import SliderInput from '@/components/slider-input.vue'

import { Range } from '@/logic/range'
import { timecodeFromSecond } from '@/logic/time'
import { BeatMeter, periodFromBpm } from '@/logic/beatMeter'

export default defineComponent({
  components: {
    VideoPlayer,
    SliderInput,
    NumberInput,
    BeatSettings
  },
  setup () {
    const videoFileInput = ref<HTMLInputElement>(null!)
    const videoFile = ref<File | null>(null)

    const player = ref<typeof VideoPlayer>(null!)
    const currentTimeDisplay = ref(0)
    const currentTimeIndicator = computed(() => {
      return timecodeFromSecond(currentTimeDisplay.value)
    })
    const playbackRate = ref(1)
    const playbackRatePercent = computed({
      get: () => playbackRate.value * 100,
      set: newRatePercent => {
        playbackRate.value = newRatePercent / 100
      }
    })

    const bpm = ref(120)
    const period = computed(() => periodFromBpm(bpm.value))
    const offset = ref(0)
    const bar = computed(() => {
      if (period.value > 0) {
        const offsetSeconds = offset.value * period.value
        return Math.floor((currentTimeDisplay.value - offsetSeconds) / period.value)
      } else {
        return 0
      }
    })
    const customBpm = ref(bpm.value)
    const customOffset = ref(offset.value)

    const saveSettingsForFile = (file: File, settings: { bpm: number, offset: number }) => {
      localStorage.setItem(file.name, JSON.stringify(settings))
    }
    const loadSettingsForFile = (file: File): { bpm: number, offset: number } | null => {
      const stored = localStorage.getItem(file.name)
      if (stored !== null) {
        return JSON.parse(stored)
      } else {
        return null
      }
    }
    watch([bpm, offset], ([newBpm, newOffset]) => {
      if (videoFile.value !== null) {
        saveSettingsForFile(videoFile.value, { bpm: newBpm, offset: newOffset })
      }
    })
    watch(videoFile, (newFile) => {
      if (newFile !== null) {
        const stored =loadSettingsForFile(newFile)
        if (stored !== null) {
          customBpm.value = stored.bpm
          customOffset.value = stored.offset
        }
      }
    })

    const range = reactive(new Range(0, 1))
    const isLooping = ref(false)
    const loopButtonText = computed(() => {
      if (!isLooping.value) {
        return 'Start loop'
      } else {
        return 'Stop loop'
      }
    })

    const playLoopStart = () => {
      const startInSeconds = secondFromBar(range.start, period.value, offset.value)
      player.value.seekToSecond(startInSeconds)
      player.value.play()
    }
    watch([isLooping, currentTimeDisplay, range] as [Ref<boolean>, Ref<DOMHighResTimeStamp>, Range], ([nowIsLooping, nowCurrentTimeDisplay, currentRange]) => {
      // When seeking to a time, the player might not be able to hit that time exactly and may choose a slightly earlier time.
      // To prevent that we get stuck in a loop, we do not restart the loop if we are very close to the start time.
      const tolerance = 0.1
      const startTime = secondFromBar(currentRange.start, period.value, offset.value) - tolerance
      const endTime = secondFromBar(currentRange.end, period.value, offset.value)
      
      const insideOfLoop = startTime < nowCurrentTimeDisplay && nowCurrentTimeDisplay < endTime
      if (nowIsLooping && !insideOfLoop) {
        playLoopStart()
      }
    })

    return {
      videoFileInput,
      videoFile,
      player,
      currentTimeDisplay,
      currentTimeIndicator,
      playbackRate,
      playbackRatePercent,
      bpm,
      period,
      offset,
      customBpm,
      customOffset,
      bar,
      isLooping,
      range,
      loopButtonText
    }
  },
  methods: {
    videoFileSelected () {
      const files = this.videoFileInput.files
      if (files === null || files.length === 0) {
        return
      }

      const newFile = files[0]
      if (newFile != null) {
        this.videoFile = newFile
      }
    },
    getCurrentTime () {
      if (this.player !== null) {
        return this.player.getCurrentTime()
      } else {
        return 0
      }
    },
    toggleLoop () {
      if (!this.isLooping) {
        this.startLoop()
      } else {
        this.stopLoop()
      }
    },
    startLoop () {
      this.isLooping = true
    },
    stopLoop () {
      this.isLooping = false
    },
    videoPaused () {
      this.stopLoop()
    },
    loopStartToNowClicked () {
      this.range.start = this.bar
    },
    loopEndToNowClicked () {
      this.range.end = this.bar
    },
  }
})

function secondFromBar(bar: number, period: number, offset: number): number {
  const offsetSeconds = offset * period
  return bar * period + offsetSeconds
}
</script>

<style scoped lang="scss">
.root-container {
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.control-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2rem;
}

label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.video-area {
 display: flex;
 flex-direction: column;
 align-items: flex-start;
 gap: 0.5rem;
}

.rate-settings, .loop-area, .beat-settings {
  border: 1px solid black;
  border-radius: 0.3rem;
  padding: 1rem;
}

.rate-settings {
  width: 100%;
}

.rate-slider {
  width: 100%;
}

.rate-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
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
  align-items: flex-start;
  gap: 1rem;

  .narrow-input {
    max-width: 8rem;
  }

  .input-with-button {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.missing-beats {
  font-style: italic;
}
</style>
