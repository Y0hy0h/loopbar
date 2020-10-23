<template>
  <div class="beat-settings">
    <div class="bpm-display">
      <span v-if="!beatMeter.needsMoreBeats" class="bpm">
        <span class="beat-indicator">{{beatIndicator}}</span>
        {{bpmDisplay}} <abbr title="Beats per minute">bpm</abbr>
      </span>
      <span v-else class="missing-beats">Press the button below to set the <abbr title="Beats per minute">bpm</abbr>.</span>
    </div>
    <button @mousedown="tappedBeat">Tap me to the beat</button>
    <button @click="resetClicked">Reset bpm</button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref, watch } from 'vue'

import NumberInput from '@/components/number-input.vue'

import { timecodeFromSecond } from '../logic/time'
import { BeatMeter } from '@/logic/beatMeter'

export default defineComponent({
  components: {
    NumberInput
  },
  props: {
    currentTime: {
      type: Number,
      required: true
    }
  },
  emits: [
    "updated-period",
    "updated-offset",
    "start-play",
  ],
  setup (props, ctx) {
    const beatMeter = reactive(new BeatMeter())

    const period = computed(() => {
      return beatMeter.period
    })
    watch(period, value => ctx.emit("updated-period", value))
    const offset = computed(() => {
      return beatMeter.offset
    })
    watch(offset, value => ctx.emit("updated-offset", value))

    const clap = computed(() => {
      const offsetSeconds = offset.value * period.value
      const beatPhase = (props.currentTime - offsetSeconds) % period.value
      // Only clap for 25 % of the beat.
      return (beatPhase / period.value) < 0.25
    })
    const beatIndicator = computed(() => {
      if (clap.value) {
        return "👏"
      } else {
        return "👐"
      }
    })

    const bpmDisplay = computed(() => beatMeter.bpm.toFixed(1))
    const offsetDisplay = computed(() => {
      const offsetPercent = beatMeter.offset * 100
      return `${offsetPercent.toFixed(0)} %`
    })

    return {
      beatMeter,
      bpmDisplay,
      offsetDisplay,
      period,
      offset,
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
  }

  .beat-indicator {
    display: inline-block;
    width: 2rem;
  }

  .missing-beats {
    font-style: italic;
  }
</style>
