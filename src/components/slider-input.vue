<template>
  <div>
    <label>
      <slot></slot>
      <div class="inputs">
        <div><input type="text" inputmode="decimal" :value="inputText" @change="newTextInput($event.target.value)"/><span><slot name="unit"></slot></span></div>
        <input type="range" :value="modelValue" @input="newSliderInput($event.target.value)" :min="min" :max="max"/>
      </div>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, toRefs, computed } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    }
  },
  emits: [
    'update:modelValue'
  ],
  setup (props) {
    const { modelValue } = toRefs(props)

    // The text input needs its own state, since it might contain an invalid number.
    // In that case we want to still store the last correct number in `modelValue`.
    const inputText = ref(formatValue(modelValue.value, props.step))

    const modelValueDisplay = computed(() => modelValue.value.toFixed(0))

    watch(modelValue, (newValue) => {
      // Only update the text input if the modelValue has changed incompatibly.
      const parsed = parseInput(inputText.value)
      if (parsed != null && parsed !== newValue) {
        inputText.value = formatValue(newValue, props.step)
      }
    })

    return {
      inputText,
      modelValueDisplay
    }
  },
  methods: {
    newTextInput (input: string) {
      this.inputText = input

      const parsed = parseInput(input)
      if (parsed != null) {
        this.$emit('update:modelValue', parsed)
      }
    },
    newSliderInput (input: string) {
      const parsed = parseInput(input)
      if (parsed != null) {
        this.$emit('update:modelValue', parsed)
      }
    }
  }
})

function parseInput (input: string): number | null {
  const parsed = Number.parseFloat(input)
  if (!isNaN(parsed)) {
    return parsed
  } else {
    return null
  }
}

function formatValue (value: number, step: number): string {
  const stepDecimals = step % 1
  if (stepDecimals === 0) {
    return value.toFixed(0)
  } else {
    return value.toFixed(2)
  }
}
</script>

<style scoped lang="scss">
  label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    input {
      width: 100%;
    }
  }

  .inputs {
    display: flex;
    flex-direction: column;
    width: 100%;

    button {
      padding: 0.2rem;
    }

    input[type="text"] {
      text-align: end;
      padding-inline: 0.5rem;
      max-width: 4rem;
    }
  }
</style>
