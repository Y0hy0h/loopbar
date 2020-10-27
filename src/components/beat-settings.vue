<template>
  <div class="beat-settings">
    <div class="visualization">
      <span class="beat-indicator">{{beatIndicator}}</span>
      {{bpmDisplay}} bpm
    </div>
    <div class="settings">
      <div class="meter">
        <label>
          <input type="radio" name="beatInput" value="meter" v-model="beatInput" v-bind:disabled="beatMeter.needsMoreBeats"/>
          Use tap settings
        </label>
        <button @mousedown="tappedBeat">Tap me to the beat</button>
        <div class="bpm-display">
          <span v-if="beatMeter.needsMoreBeats" class="missing-beats">
            Set the beats per minute (bpm) by tapping the button.
          </span>
          <span v-else class="bpm">
            {{meterBpmDisplay}} bpm (offset {{meterOffsetDisplay}})
          </span>
        </div>
        <button @click="resetClicked">Reset bpm</button>
      </div>
      <div class="custom">
        <label>
          <input type="radio" name="beatInput" value="custom" v-model="beatInput"/>
          Use custom settings
        </label>
        <NumberInput v-model="customBpm">Beats per minute (bpm)</NumberInput>
        <NumberInput v-model="customOffset">Offset</NumberInput>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref, watch } from 'vue'

import NumberInput from '@/components/number-input.vue'
import { BeatMeter, periodFromBpm } from '@/logic/beatMeter'

export default defineComponent({
  components: {
    NumberInput
  },
  props: {
    initialBpm: {
      type: Number,
      required: true
    },
    initialOffset: {
      type: Number,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    }
  },
  emits: [
    'update:bpm',
    'update:offset',
    'start-play'
  ],
  setup (props, ctx) {
    const beatInput = ref('custom')
    const customBpm = ref(props.initialBpm)
    const customOffset = ref(props.initialOffset)
    
    const beatMeter = reactive(new BeatMeter())

    const period = computed(() => {
      if (beatInput.value === 'meter') {
        return beatMeter.period
      } else {
        return periodFromBpm(customBpm.value)
      }
    })
    const bpm = computed(() => {
      if (beatInput.value === 'meter') {
        return beatMeter.bpm
      } else {
        return customBpm.value
      }
    })
    const offset = computed(() => {
      if (beatInput.value === 'meter') {
        return beatMeter.offset
      } else {
        return customOffset.value
      }
    })

    watch(bpm, (newBpm) => ctx.emit('update:bpm', newBpm))
    watch(offset, (newOffset) => ctx.emit('update:offset', newOffset))

    const clap = computed(() => {
      const offsetSeconds = offset.value * period.value
      const beatPhase = (props.currentTime - offsetSeconds) % period.value
      // Only clap for 25 % of the beat.
      return (beatPhase / period.value) < 0.25
    })
    const beatIndicator = computed(() => {
      if (clap.value) {
        return '👏'
      } else {
        return '👐'
      }
    })

    const meterBpmDisplay = computed(() => beatMeter.bpm.toFixed(1))
    const meterOffsetDisplay = computed(() => `${beatMeter.offset.toFixed(1)} %`)

    const bpmDisplay = computed(() => bpm.value.toFixed(1))
    const offsetDisplay = computed(() => {
      const offsetPercent = offset.value * 100
      return `${offsetPercent.toFixed(0)} %`
    })

    return {
      customBpm,
      customOffset,
      meterBpmDisplay,
      meterOffsetDisplay,
      bpmDisplay,
      offsetDisplay,
      beatMeter,
      beatIndicator,
      beatInput,
    }
  },
  methods: {
    tappedBeat () {
      this.$emit('start-play')
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
    flex-direction: row;
    align-items: flex-start;
  }

  .beat-settings {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1em;
  }

  .settings {
    align-self: stretch;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10em, 1fr));
    gap: 1rem;
  }

  .meter {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
  }

  .bpm-display {
    display: inline-block;
  }

  .beat-indicator {
    display: inline-block;
    width: 1.5em;
  }

  .missing-beats {
    font-style: italic;
  }
</style>
