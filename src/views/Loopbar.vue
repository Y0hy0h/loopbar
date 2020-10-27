<template>
  <div class="container">
    <div class="video-area">
      <label>
        Choose a video file
        <input ref="videoFileInput" type="file" accept="video/*" @change="videoFileSelected"/>
      </label>
      <VideoPlayer ref="player" :file="videoFile" @updated-time-display="currentTimeDisplay = $event" @paused="videoPaused"></VideoPlayer>
      <span class="currentTime">
        Beat #{{bar}} ({{currentTimeIndicator}})
      </span>
    </div>
    <div class="loop-area">
      <button @click="toggleLoop()">{{loopButtonText}}</button>
      <div class="loop-settings">
        <div class="input-with-button">
          <NumberInput v-model="range.start">from</NumberInput>
          <button @click="loopStartToNowClicked()">set to now</button>
        </div>
        <NumberInput v-model="range.duration">for duration</NumberInput>
        <div class="input-with-button">
          <NumberInput v-model="range.end">to</NumberInput>
          <button @click="loopEndToNowClicked()">set to now</button>
        </div>
      </div>
    </div>
    <BeatSettings :currentTimeDisplay="currentTimeDisplay" :getCurrentTime="getCurrentTime" v-model:bpm="bpm" v-model:offset="offset" @start-play="player.play()"></BeatSettings>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue'

import VideoPlayer from '@/components/video-player.vue'
import BeatSettings from '@/components/beat-settings.vue'
import NumberInput from '@/components/number-input.vue'

import { Range } from '@/logic/range'
import { timecodeFromSecond } from '@/logic/time'
import { BeatMeter, periodFromBpm } from '@/logic/beatMeter'

export default defineComponent({
  components: {
    VideoPlayer,
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
          bpm.value = stored.bpm
          offset.value = stored.offset
        }
      }
    })

    const range = reactive(new Range(0, 1))
    const intervallId = ref<number | null>(null)
    const isLooping = computed(() => {
      return intervallId.value != null
    })
    const loopButtonText = computed(() => {
      if (!isLooping.value) {
        return 'Start loop'
      } else {
        return 'Stop loop'
      }
    })

    return {
      videoFileInput,
      videoFile,
      player,
      currentTimeDisplay,
      currentTimeIndicator,
      bpm,
      period,
      offset,
      bar,
      range,
      intervallId,
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
      if (this.intervallId == null) {
        this.startLoop()
      } else {
        this.stopLoop()
      }
    },
    startLoop () {
      this.$_playLoopStart()
      const durationInMilliseconds = this.range.duration * this.period * 1000
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
    loopStartToNowClicked () {
      this.range.start = this.bar
    },
    loopEndToNowClicked () {
      this.range.end = this.bar
    },
    $_playLoopStart () {
      const startInSeconds = this.$_secondFromBar(this.range.start)
      this.player.seekToSecond(startInSeconds)
      this.player.play()
    },
    $_pause () {
      this.player.pause()
    },
    $_secondFromBar (bar: number): number {
      return bar * this.period + this.offset
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
