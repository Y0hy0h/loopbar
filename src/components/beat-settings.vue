<template>
  <div class="beat-settings">
    <input type="checkbox" v-model="clap"/>
    <span class="bpm">{{bpmDisplay}} bpm (offset {{offsetDisplay}})</span>
    <button @mousedown="tappedBeat">Tap along the beat</button>
    <button @click="resetClicked">Reset bpm</button>
    <label>
      Override with known bpm
      <input type="checkbox" v-model="useCustomBpm"/>
      <NumberInput v-model="customBpm"></NumberInput>
    </label>
    <label>
      Override with known offset
      <input type="checkbox" v-model="useCustomOffset"/>
      <NumberInput v-model="customOffset"></NumberInput>
      <input type="range" min="0" max="1" step="0.01" v-model.number="customOffset"/>
    </label>
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
  ],
  setup (props, ctx) {
    const useCustomBpm = ref(false)
    const customBpm = ref<number>(0)
    const useCustomOffset = ref(false)
    const customOffset = ref(0.5)

    const beatMeter = reactive(new BeatMeter())

    const period = computed(() => {
      if (useCustomBpm.value) {
        return 60 / customBpm.value
      } else {
        return beatMeter.period
      }
    })
    watch(period, value => ctx.emit("updated-period", value))
    const offset = computed(() => {
      if (useCustomOffset.value) {
        return customOffset.value
      } else {
        return beatMeter.offset
      }
    })
    watch(offset, value => ctx.emit("updated-offset", value))

    const clap = computed(() => {
      const offsetSeconds = offset.value * period.value
      const beatPhase = (props.currentTime - offsetSeconds) % period.value
      // Only clap for 25 % of the beat.
      return (beatPhase / period.value) < 0.25
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
      useCustomBpm,
      customBpm,
      useCustomOffset,
      customOffset,
      period,
      offset,
      clap
    }
  },
  methods: {
    tappedBeat () {
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
</style>
