<template>
  <div class="videoArea">
    <label>
      Choose a video file
      <input ref="videoFileInput" type="file" accept="video/*" @change="videoFileSelected"/>
    </label>
    <video ref="player" id="player" controls @timeupdate="timeUpdated"></video>
    <span class="currentTime">{{currentTimeIndicator}}</span>
  </div>
  <div class="loopArea">
    <label>
      Start
      <input type="number" :value="startValue" @input="setStartValue($event.target.value)"/>
    </label>
    <label>
      Duration
      <input type="number" :value="durationValue" @input="setDurationValue($event.target.value)"/>
    </label>
    <label>
      End
      <input type="number" :value="endValue" @input="setEndValue($event.target.value)"/>
    </label>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

import { timecodeFromSecond } from '../logic/time'

@Options({})
export default class Home extends Vue {
  currentSecond = 0;
  get currentTimeIndicator(): string {
    return timecodeFromSecond(this.currentSecond)
  }

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

  startValue: string = this.updateStartValue();
  private setStartValue(newStart: string) {
    this.startValue = newStart;
    const parsed = this.parseSecond(newStart);
    if (parsed != null && parsed != this.startInSeconds) {
      this.startInSeconds = parsed;
      this.updateStartValue();
      this.updateEndValue();
    }
  };
  private updateStartValue (): string {
    const newValue = this.formatSeconds(this.startInSeconds);
    this.startValue = newValue;
    return newValue;
  }

  durationValue = this.updateDurationValue();
  private setDurationValue(newDuration: string) {
    this.durationValue = newDuration;
    const parsed = this.parseSecond(newDuration);
    if (parsed != null && parsed != this.durationInSeconds) {
      this.durationInSeconds = parsed;
      this.updateDurationValue();
      this.updateEndValue();
    }
  };
  updateDurationValue (): string {
    const newValue = this.formatSeconds(this.durationInSeconds);
    this.durationValue = newValue;
    return newValue;
  }
  endValue = this.updateEndValue();
  private setEndValue(newEnd: string) {
    this.endValue = newEnd;
    const parsed = this.parseSecond(newEnd)
    if (parsed != null && parsed != this.endInSeconds) {
      const newDuration = parsed - this.startInSeconds;
      if (newDuration >= 0) {
        this.durationInSeconds = newDuration;
        this.updateDurationValue();
        this.updateEndValue();
      } else {
        this.startInSeconds = this.startInSeconds + newDuration; // newDuration is negative.
        this.durationInSeconds = 0;
        this.updateStartValue();
        this.updateDurationValue();
        this.updateEndValue();
      }
    }
  };
  updateEndValue (): string {
    const newValue = this.formatSeconds(this.startInSeconds + this.durationInSeconds);
    this.endValue = newValue;
    return newValue;
  }

  private formatSeconds (seconds: number): string {
    return seconds.toFixed(2);
  }
  private parseSecond (raw: string): number | null {
    const parsed = Number.parseFloat(raw);
    if (parsed == NaN) {
      return null;
    } else {
      return parsed;
    }
  }

  $refs!: {
    videoFileInput: HTMLInputElement,
    player: HTMLVideoElement,
  }

  videoFileSelected () {
    // Handle case where no file is present.
    const videoFile = this.$refs.videoFileInput.files?.[0];
    const fileUrl = URL.createObjectURL(videoFile);
    this.$refs.player.src = fileUrl;
  }

  timeUpdated () {
    this.currentSecond = this.$refs.player.currentTime;
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