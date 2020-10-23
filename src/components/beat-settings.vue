<template>
  <div class="beat-settings">
    <button @mousedown="tappedBeat">Tap me to the beat</button>
    <div class="bpm-display">
      <span v-if="!beatMeter.needsMoreBeats" class="bpm">
        <span class="beat-indicator">{{beatIndicator}}</span>
        {{bpmDisplay}} bpm
      </span>
      <span v-else class="missing-beats">Set the beats per minute (bpm) by tapping the button.</span>
    </div>
    <button @click="resetClicked">Reset bpm</button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref, watch } from 'vue'

import NumberInput from '@/components/number-input.vue'

import { timecodeFromSecond } from '@/logic/time'
import { BeatMeter } from '@/logic/beatMeter'

export default defineComponent({
  components: {
    NumberInput
  },
  props: {
    beatMeter: {
      type: Object as PropType<BeatMeter>,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    }
  },
  emits: [
    "update:beatMeter",
    "start-play",
  ],
  setup (props, ctx) {
    const clap = computed(() => {
      const offsetSeconds = props.beatMeter.offset * props.beatMeter.period
      const beatPhase = (props.currentTime - offsetSeconds) % props.beatMeter.period
      // Only clap for 25 % of the beat.
      return (beatPhase / props.beatMeter.period) < 0.25
    })
    const beatIndicator = computed(() => {
      if (clap.value) {
        return "👏"
      } else {
        return "👐"
      }
    })

    const bpmDisplay = computed(() => props.beatMeter.bpm.toFixed(1))
    const offsetDisplay = computed(() => {
      const offsetPercent = props.beatMeter.offset * 100
      return `${offsetPercent.toFixed(0)} %`
    })

    return {
      bpmDisplay,
      offsetDisplay,
      beatIndicator
    }
  },
  methods: {
    tappedBeat () {
      this.$emit("start-play")
      this.beatMeter.addBeats(this.currentTime)
    },
    resetClicked () {
      this.beatMeter.reset()
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

  .beat-settings {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .bpm-display {
    display: inline-block;
  }

  .beat-indicator {
    display: inline-block;
    width: 2rem;
  }

  .missing-beats {
    font-style: italic;
  }
</style>
