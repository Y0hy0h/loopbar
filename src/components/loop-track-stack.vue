<template>
  <div class="loop-track-stack-container">
    <!-- eslint-disable-next-line vue/require-v-for-key -->
    <div class="track" v-for="(track, trackIndex) in trackStack.tracks">
      <!-- eslint-disable-next-line vue/require-v-for-key -->
      <div class="loop" v-for="(loop, loopIndex) in track.items" :style="{ left: `${normalized(loop.getStart())}%`, width: `${normalizedWidth(loop)}%` }" :class="{ selected: isSelected(trackIndex, loopIndex) }" @click="select(trackIndex, loopIndex)"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { Loop, TrackStack, Selection } from '@/logic/trackStack'

export default defineComponent({
  props: {
    trackStack: {
      type: Object as PropType<TrackStack<Loop>>,
      required: true
    },
    selected: {
      type: Object as PropType<Selection | null>,
      required: true
    },
    duration: {
      type: Number,
      required: true
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
    select (trackIndex: number, itemIndex: number) {
      const selected = { track: trackIndex, item: itemIndex }
      this.$emit('update:selected', selected)
    },
    isSelected (trackIndex: number, itemIndex: number): boolean {
      if (this.selected !== null) {
        return trackIndex === this.selected.track && itemIndex === this.selected.item
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
  background-color: gray;
}
</style>
