<template>
  <VideoPlayer ref="player"></VideoPlayer>
  <div class="loopArea">
    <NumberInput v-model="startInSeconds">Start</NumberInput>
    <NumberInput v-model="durationInSeconds">Duration</NumberInput>
    <NumberInput v-model="endInSeconds">End</NumberInput>
    <button @click="toggleLoop()">Toggle looping</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

import VideoPlayer from '@/components/video-player.vue';
import NumberInput from '@/components/number-input.vue';

import { timecodeFromSecond } from '../logic/time'

@Options({
  components: {
    VideoPlayer,
    NumberInput,
  }
})
export default class Loopbar extends Vue {
  startInSeconds_ = 0;
  get startInSeconds () {
    return this.startInSeconds_;
  }
  set startInSeconds (newValue: number) {
    this.startInSeconds_ = Math.max(0, newValue);
  }
  durationInSeconds_ = 1;
  get durationInSeconds () {
    return this.durationInSeconds_;
  }
  set durationInSeconds (newValue: number) {
    this.durationInSeconds_ = Math.max(0, newValue);
  }
  get endInSeconds () {
    return this.startInSeconds + this.durationInSeconds;
  }
  set endInSeconds (newEnd: number) {
    const newDuration = newEnd - this.startInSeconds;
    if (newDuration >= 0) {
      this.durationInSeconds = newDuration;
    } else {
      this.startInSeconds = this.startInSeconds + newDuration; // newDuration is negative.
      this.durationInSeconds = 0;
    }
  }

  private intervallId: number | null = null;

  $refs!: {
    player: VideoPlayer,
  }

  toggleLoop () {
    if (this.intervallId == null) {
      this.startLoop();
    } else {
      this.stopLoop();
    }
  }

  startLoop () {
    this.playLoopStart();
    const durationInMilliseconds = this.durationInSeconds * 1000;
    this.intervallId = setInterval(() => this.playLoopStart(), durationInMilliseconds);
  }

  stopLoop () {
    if (this.intervallId != null) {
      clearInterval(this.intervallId);
      this.intervallId = null;
    }
  }

  private playLoopStart () {
    this.$refs.player.seekToSecond(this.startInSeconds);
    this.$refs.player.play();
  }

  private pause() {
    this.$refs.player.pause();
  }
}
</script>

<style>
  label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .videoArea {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  #player {
    max-width: 100%;
    max-height: 50vh;
  }

  .currentTime {
    font-family: monospace;
    font-size: 2rem;
  }
</style>