<template>
  <label>
    <slot></slot>
    <div class="inputs">
      <button @click="decrement">⬅️</button>
      <input type="text" inputmode="decimal" :value="inputText" @change="newInput($event.target.value)"/>
      <button @click="increment">➡️</button>
    </div>
  </label>
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
  emits: [
    'update:modelValue'
  ],
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
  if (value % 1 === 0) { // if it is a whole number
    return value.toString()
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
    flex-direction: row;
    width: 100%;

    button {
      padding: 0.2rem;
    }

    input {
      padding-inline: 0.5rem;
      max-width: 3rem;
    }
  }
</style>
