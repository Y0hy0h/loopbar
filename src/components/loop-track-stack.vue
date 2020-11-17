<template>
  <div class="loop-track-stack-container">
    <!-- eslint-disable-next-line vue/require-v-for-key -->
    <div class="track" v-for="track in trackStack.tracks">
      <!-- eslint-disable-next-line vue/require-v-for-key -->
      <div class="loop" v-for="entry in track.items" :style="{ left: `${normalized(entry.getStart())}%`, width: `${normalizedWidth(entry)}%` }" :class="{ selected: isSelected(entry.index) }" @click="select(entry.index)"/>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from 'vue'

import { Loop, TrackStack, Ranged } from '@/logic/trackStack'

class LoopEntry implements Ranged {
  // eslint-disable-next-line no-useless-constructor
  constructor (
    public loop: Loop,
    public index: number
  ) {}

  getStart (): number {
    return this.loop.getStart()
  }

  getEnd (): number {
    return this.loop.getEnd()
  }

  getDuration (): number {
    return this.loop.getDuration()
  }
}

export default defineComponent({
  props: {
    loops: {
      type: Array as PropType<Loop[]>,
      required: true
    },
    selected: {
      type: Number as PropType<number | null>,
      default: null
    },
    duration: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const { loops } = toRefs(props)

    const trackStack = computed(() => {
      const stack = new TrackStack()
      loops.value.forEach((loop, index) => {
        const entry = new LoopEntry(loop, index)
        stack.insert(entry)
      })
      return stack
    })

    return {
      trackStack
    }
  },
  emits: [
    'update:selected'
  ],
  methods: {
    normalized (unit: number): number {
      return (unit / this.duration) * 100
    },
    normalizedWidth (loop: Loop): number {
      return this.normalized(loop.getEnd() - loop.getStart())
    },
    select (index: number) {
      this.$emit('update:selected', index)
    },
    isSelected (index: number): boolean {
      if (this.selected !== null) {
        return this.selected === index
      } else {
        return false
      }
    }
  }
})
</script>

<style scoped lang="scss">
.loop-track-stack-container {
  width: 100%;
}

.track {
  position: relative;
  width: 100%;
  height: 2em;
}

.loop {
  position: absolute;
  top: 0;
  border: 1px solid black;
  height: 100%;
}

.loop.selected {
  background-color: hsl(0, 0%, 71%);
}
</style>
