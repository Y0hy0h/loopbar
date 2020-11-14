<template>
  <div class="root-container">
    <div class="control-container" v-if="videoFile !== null">
      <div class="video-area">
        <VideoPlayer
          ref="player"
          class="player"
          :file="videoFile"
          @update:time-display="currentTimeDisplay = $event"
          @update:isPlaying="isPlaying = $event"
          v-model:playbackRate="playbackRate"
          @update:duration="duration = $event"
          :mirrored="mirrored"
        ></VideoPlayer>
        <div class="video-controls">
          <div class="control-group">
            <button @click="togglePlay()">{{ playButtonText }}</button>
            <NumberInput v-model="playbackRatePercent">Speed (in %)</NumberInput>
          </div>
          <div class="control-group">
            <label class="compact-label">
              <input type="checkbox" v-model="isLooping"/>
              Loop
            </label>
            <button @click="goToLoopStart()">Go to loop start</button>
          </div>
          <div class="control-group">
            <label class="compact-label">
              <input type="checkbox" v-model="mirrored"/>
              Mirrored
            </label>
          </div>
        </div>
        <span class="currentTime">
          Beat #{{ bar }} ({{ currentTimeIndicator }})
        </span>
        <Slider class="time-slider" :modelValue="currentTimeDisplay" @update:modelValue="seekToSecond($event)" :min="0" :max="duration" :step="0.01"></Slider>
      </div>
      <div class="loop-area">
        <button @click="toggleLoop()">{{ loopButtonText }}</button>
        <div class="loop-settings">
          <div class="input-with-button">
            <NumberInput
              :modelValue="range.start"
              @update:modelValue="range.setStart($event)"
              class="narrow-input"
              >from</NumberInput
            >
            <button @click="loopStartToNowClicked()">set to now</button>
          </div>
          <NumberInput
            :modelValue="range.duration"
            @update:modelValue="range.setDurationByShiftingEnd($event)"
            class="narrow-input"
            >for duration</NumberInput
          >
          <div class="input-with-button">
            <NumberInput
              :modelValue="range.end"
              @update:modelValue="range.setEnd($event)"
              class="narrow-input"
              >to</NumberInput
            >
            <button @click="loopEndToNowClicked()">set to now</button>
          </div>
        </div>
        <div class="loop-settings">
          Shift loop
          <button @click="shiftLoop(-1)">⬅️</button>
          <button @click="shiftLoop(+1)">➡️️</button>
          <NumberInput v-model="shiftMultiplier">Shift multiplier</NumberInput>
        </div>
      </div>
      <BeatSettings
        class="beat-settings"
        :currentTimeDisplay="currentTimeDisplay"
        :getCurrentTime="getCurrentTime"
        :customBpm="customBpm"
        :customOffset="customOffset"
        @update:bpm="bpm = $event"
        @update:offset="offset = $event"
        @start-play="player.play()"
      ></BeatSettings>
    </div>
    <label>
      Choose a video file
      <input
        ref="videoFileInput"
        type="file"
        accept="video/*"
        @change="videoFileSelected"
      />
    </label>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, Ref, ref, watch } from 'vue'

import VideoPlayer from '@/components/video-player.vue'
import BeatSettings from '@/components/beat-settings.vue'
import NumberInput from '@/components/number-input.vue'
import Slider from '@/components/slider.vue'

import { Range } from '@/logic/range'
import { timecodeFromSecond } from '@/logic/time'
import { periodFromBpm } from '@/logic/beatMeter'

export default defineComponent({
  components: {
    VideoPlayer,
    NumberInput,
    Slider,
    BeatSettings
  },
  setup () {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const videoFileInput = ref<HTMLInputElement>(null!)
    const videoFile = ref<File | null>(null)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const player = ref<typeof VideoPlayer>(null!)
    const duration = ref<number | null>(null)
    const mirrored = ref(false)
    const isPlaying = ref(false)
    const playButtonText = computed(() => {
      if (isPlaying.value) {
        return 'Pause'
      } else {
        return 'Play'
      }
    })
    const currentTimeDisplay = ref(0)
    const currentTimeIndicator = computed(() => {
      return timecodeFromSecond(currentTimeDisplay.value)
    })
    const playbackRate = ref(1)
    const playbackRatePercent = computed({
      get: () => playbackRate.value * 100,
      set: (newRatePercent) => {
        playbackRate.value = newRatePercent / 100
      }
    })

    const bpm = ref(120)
    const period = computed(() => periodFromBpm(bpm.value))
    const offset = ref(0)
    const bar = computed(() => {
      if (period.value > 0) {
        const offsetSeconds = offset.value * period.value
        return Math.floor(
          (currentTimeDisplay.value - offsetSeconds) / period.value
        )
      } else {
        return 0
      }
    })
    const customBpm = ref(bpm.value)
    const customOffset = ref(offset.value)

    const range = reactive(Range.fromStartAndDuration(0, 8))
    const shiftMultiplier = ref(8)
    const isLooping = ref(false)
    const loopButtonText = computed(() => {
      if (!isLooping.value) {
        return 'Start loop'
      } else {
        return 'Stop loop'
      }
    })

    const goToLoopStart = () => {
      const startInSeconds = secondFromBar(
        range.start,
        period.value,
        offset.value
      )
      player.value.seekToSecond(startInSeconds)
    }
    const playLoopStart = () => {
      goToLoopStart()
      player.value.play()
    }
    watch(
      [isLooping, currentTimeDisplay, range] as [
        Ref<boolean>,
        Ref<DOMHighResTimeStamp>,
        Range
      ],
      ([nowIsLooping, nowCurrentTimeDisplay, currentRange]) => {
        // When seeking to a time, the player might not be able to hit that time exactly and may choose a slightly earlier time.
        // To prevent that we get stuck in a loop, we do not restart the loop if we are very close to the start time.
        const tolerance = 0.1
        const startTime =
          secondFromBar(currentRange.start, period.value, offset.value) -
          tolerance
        const endTime = secondFromBar(
          currentRange.end,
          period.value,
          offset.value
        )

        const insideOfLoop =
          startTime < nowCurrentTimeDisplay && nowCurrentTimeDisplay < endTime
        if (nowIsLooping && !insideOfLoop) {
          playLoopStart()
        }
      }
    )

    interface Settings {
      bpm: number;
      offset: number;
      range: {
        start: number;
        end: number;
      };
    }
    const saveSettingsForFile = (file: File, settings: Settings) => {
      localStorage.setItem(file.name, JSON.stringify(settings))
    }
    const loadSettingsForFile = (file: File): Settings | null => {
      const stored = localStorage.getItem(file.name)
      if (stored !== null) {
        return JSON.parse(stored)
      } else {
        return null
      }
    }
    watch(
      [bpm, offset, range] as [Ref<number>, Ref<number>, Range],
      ([newBpm, newOffset, newRange]) => {
        if (videoFile.value !== null) {
          saveSettingsForFile(videoFile.value, {
            bpm: newBpm,
            offset: newOffset,
            range: { start: newRange.start, end: newRange.end }
          })
        }
      }
    )
    watch(videoFile, (newFile) => {
      if (newFile !== null) {
        const stored = loadSettingsForFile(newFile)
        if (stored !== null) {
          customBpm.value = stored.bpm
          customOffset.value = stored.offset
          range.setStart(stored.range.start)
          range.setEnd(stored.range.end)
        }
      }
    })

    return {
      videoFileInput,
      videoFile,
      isPlaying,
      player,
      duration,
      mirrored,
      playButtonText,
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
      shiftMultiplier,
      loopButtonText,
      goToLoopStart,
      playLoopStart
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
    seekToSecond (second: number) {
      this.player.seekToSecond(second)
    },
    togglePlay () {
      this.player.togglePlay()
    },
    shiftLoop (direction: number) {
      const offset = direction * this.shiftMultiplier
      this.range.shift(offset)
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
      this.playLoopStart()
    },
    stopLoop () {
      this.isLooping = false
    },
    videoPaused () {
      this.stopLoop()
    },
    loopStartToNowClicked () {
      this.range.setStart(this.bar)
    },
    loopEndToNowClicked () {
      this.range.setEnd(this.bar)
    }
  }
})

function secondFromBar (bar: number, period: number, offset: number): number {
  const offsetSeconds = offset * period
  return bar * period + offsetSeconds
}
</script>

<style scoped lang="scss">
.root-container {
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
  width: 100%;
}

label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.compact-label {
  display: inline-flex;
  flex-direction: row;
}

.video-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  width: 100%;
}

.player {
  width: 100%;
  max-width: 100%;
}

.video-controls {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  column-gap: 2rem;
  row-gap: 1rem;
  align-items: center;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media(min-width: 28em) {
  .control-group {
    flex-direction: row;
  }
}

.time-slider {
  width: 100%;
}

.loop-area,
.beat-settings {
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
