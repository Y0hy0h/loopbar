<template>
  <div class="number-input">
    <button class="first-button" @click="decrement">⬅️</button>
    <label>
      <div class="label">
        <slot></slot>
      </div>
      <input
        class="input"
        type="text"
        inputmode="decimal"
        :value="inputText"
        @change="newInput($event.target.value)"
      />
    </label>
    <button class="second-button" @click="increment">➡️</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, toRefs } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup (props) {
    const { modelValue } = toRefs(props)

    const inputText = ref(formatValue(modelValue.value))

    watch(modelValue, (newValue) => {
      const parsed = parseInput(inputText.value)
      if (parsed != null && parsed !== newValue) {
        inputText.value = formatValue(newValue)
      }
    })

    return {
      inputText
    }
  },
  methods: {
    newInput (input: string) {
      this.inputText = input

      const parsed = parseInput(input)
      if (parsed != null) {
        this.$emit('update:modelValue', parsed)
      }
    },
    increment () {
      this.$emit('update:modelValue', this.modelValue + 1)
    },
    decrement () {
      this.$emit('update:modelValue', this.modelValue - 1)
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

function formatValue (value: number): string {
  if (value % 1 === 0) {
    // if it is a whole number
    return value.toString()
  } else {
    return value.toFixed(2)
  }
}
</script>

<style scoped lang="scss">
.number-input {
  display: grid;
  grid-template-areas:
    "label label label"
    "first input second";
}

.label {
  grid-area: label;
}

.first-button {
  grid-area: first;
}

.input {
  grid-area: input;
}

.second-button {
  grid-area: second;
}

label {
  display: contents;
}

input {
  padding-inline: 0.5rem;
  width: 100%;
  min-width: 2em;
}

button {
  padding: 0.2rem;
}
</style>
