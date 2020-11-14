<template>
  <div class="beat-settings">
    <div class="visualization">
      <span class="beat-indicator">{{ beatIndicator }}</span>
      {{ bpmDisplay }} bpm
    </div>
    <div class="settings-area">
      <div class="custom setting">
        <div class="header">
          <label>
            <input
              type="radio"
              name="beatInput"
              value="custom"
              v-model="beatInput"
            />
            Use custom settings
          </label>
        </div>
        <div class="inputs">
          <NumberInput v-model="customBpmRef"
            >Beats per minute (bpm)</NumberInput
          >
          <SliderInput v-model="customOffsetPercent" :min="-50" :max="50">
            Offset
            <template v-slot:unit> % of bpm</template>
          </SliderInput>
        </div>
      </div>
      <div class="meter setting">
        <div class="header">
          <label>
            <input
              type="radio"
              name="beatInput"
              value="meter"
              v-model="beatInput"
              :disabled="beatMeter.needsMoreBeats"
            />
            <div>
              <span :class="{ disabled: beatMeter.needsMoreBeats }"
                >Use tap settings</span
              >
              <span v-if="beatMeter.needsMoreBeats">
                (unavailable until set)</span
              >
            </div>
          </label>
        </div>
        <div class="inputs">
          <button @mousedown="tappedBeat">Tap me to the beat</button>
          <div class="bpm-display">
            <span v-if="beatMeter.needsMoreBeats" class="missing-beats">
              Set the beats per minute (bpm) by tapping the button.
            </span>
            <span v-else class="bpm">
              {{ meterBpmDisplay }} bpm (offset {{ meterOffsetDisplay }})
            </span>
          </div>
          <button @click="resetClicked">Reset bpm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  reactive,
  ref,
  toRef,
  watch
} from 'vue'

import NumberInput from '@/components/number-input.vue'
import SliderInput from '@/components/slider-input.vue'

import { BeatMeter, periodFromBpm } from '@/logic/beatMeter'

export default defineComponent({
  components: {
    NumberInput,
    SliderInput
  },
  props: {
    customBpm: {
      type: Number,
      required: true
    },
    customOffset: {
      type: Number,
      required: true
    },
    currentTimeDisplay: {
      type: Number,
      required: true
    },
    getCurrentTime: {
      type: Function as PropType<() => DOMHighResTimeStamp>,
      required: true
    }
  },
  emits: ['update:bpm', 'update:offset', 'start-play'],
  setup (props, ctx) {
    const beatInput = ref('custom')
    const customBpmRef = ref(props.customBpm)
    const customOffsetRef = ref(props.customOffset)
    const customOffsetPercent = computed({
      get: () => {
        return customOffsetRef.value * 100
      },
      set: (newOffsetPercent: number) => {
        customOffsetRef.value = newOffsetPercent / 100
      }
    })

    watch(toRef(props, 'customBpm'), (newPropBpm) => {
      if (newPropBpm !== customBpmRef.value) {
        customBpmRef.value = newPropBpm
      }
    })
    watch(toRef(props, 'customOffset'), (newPropOffset) => {
      if (newPropOffset !== customOffsetRef.value) {
        customOffsetRef.value = newPropOffset
      }
    })
    watch([customBpmRef, customOffsetRef], () => {
      beatInput.value = 'custom'
    })

    const beatMeter = reactive(new BeatMeter())
    // We cannot watch the beatMeter, because tapping a button might not change the beat settings,
    // and then the watch hook will not be triggered.
    // Instead we react on all the button presses in this section.

    const period = computed(() => {
      if (beatInput.value === 'meter') {
        return beatMeter.period
      } else {
        return periodFromBpm(customBpmRef.value)
      }
    })
    const bpm = computed(() => {
      if (beatInput.value === 'meter') {
        return beatMeter.bpm
      } else {
        return customBpmRef.value
      }
    })
    const offset = computed(() => {
      if (beatInput.value === 'meter') {
        return beatMeter.offset
      } else {
        return customOffsetRef.value
      }
    })

    watch(bpm, (newBpm) => ctx.emit('update:bpm', newBpm))
    watch(offset, (newOffset) => ctx.emit('update:offset', newOffset))

    const clap = computed(() => {
      const offsetSeconds = offset.value * period.value
      const beatPhase =
        (props.currentTimeDisplay - offsetSeconds) % period.value
      // Only clap for 25 % of the beat.
      return beatPhase / period.value < 0.25
    })
    const beatIndicator = computed(() => {
      if (clap.value) {
        return '👏'
      } else {
        return '👐'
      }
    })

    const meterBpmDisplay = computed(() => beatMeter.bpm.toFixed(1))
    const meterOffsetDisplay = computed(
      () => `${(beatMeter.offset * 100).toFixed(0)} %`
    )

    const bpmDisplay = computed(() => bpm.value.toFixed(1))
    const offsetDisplay = computed(() => {
      const offsetPercent = offset.value * 100
      return `${offsetPercent.toFixed(0)} %`
    })

    return {
      customOffsetPercent,
      customBpmRef,
      meterBpmDisplay,
      meterOffsetDisplay,
      bpmDisplay,
      offsetDisplay,
      beatMeter,
      beatIndicator,
      beatInput
    }
  },
  methods: {
    tappedBeat () {
      this.$emit('start-play')
      this.beatMeter.addBeats(this.getCurrentTime())

      if (!this.beatMeter.needsMoreBeats) {
        this.beatInput = 'meter'
      }
    },
    resetClicked () {
      this.beatMeter.reset()
      this.beatInput = 'custom'
    }
  }
})
</script>

<style scoped lang="scss">
label {
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  input[type="radio"] {
    margin-inline-end: 0.5em;
  }
}

.disabled {
  color: hsl(0, 0%, 50%);
}

.beat-settings {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1em;
}

.settings-area {
  align-self: stretch;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10em, 1fr));
  gap: 1rem;
  align-items: flex-start;
}

.setting {
  padding: 0.5em;
  border: 1px solid black;
  border-radius: 0.1em;
}

.header {
  margin-block-end: 0.5em;
}

.inputs {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
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
