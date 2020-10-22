import { timecodeFromSecond } from './time'

export class BeatMeter {
  constructor (
        private beats: number[] = []
  ) {
    this.calculate(beats)
  }

    private bpm_ = 0
    public get bpm () {
      return this.bpm_
    }

    private offset_ = 0
    public get offset () {
      return this.offset_
    }

    public addBeats (...offsetsInSeconds: number[]) {
      this.beats.push(...offsetsInSeconds)
      sortNumerically(this.beats)

      this.calculate(this.beats)
    }

    public reset () {
        this.beats = []
        this.calculate(this.beats)
    }

    private calculate (beats: number[]) {
      this.bpm_ = calculateBpm(beats)
      this.offset_ = calculateOffset(beats, this.bpm)
    }
}

function calculateBpm (beats: number[]): number {
  if (beats.length == 0) {
    return 0
  }

  const distancesWithOutliers = sortNumerically(getDistancesBetweenBeats(beats))
  const distances = removeOutliers(distancesWithOutliers)

  // Remove outliers for better error tolerance.
  const averageDistanceInSeconds = distances.reduce((accu, next) => accu + next, 0) / distances.length

  return 60 / averageDistanceInSeconds
}

/**
 * @param beats A non-empty, sorted list of beat timestamps in seconds, smallest first.
 */
function getDistancesBetweenBeats (beats: number[]): number[] {
  const distances = new Array(beats.length - 1)

  // Iterate over pairs of beats.
  for (let i = 0; i < beats.length - 1; i++) {
    const first = beats[i]
    const second = beats[i + 1]

    const distance = second - first
    distances[i] = distance
  }

  return distances
}

function calculateOffset (beats: number[], bpm: number): number {
  if (bpm == 0) {
    return 0
  }

  const hertz = 60 / bpm
  const offsetsWithOutliers = sortNumerically(beats.map(beat => beat % hertz))
  const offsets = removeOutliers(offsetsWithOutliers)

  const averageOffset = offsets.reduce((accu, next) => accu + next, 0) / offsets.length
  return averageOffset / hertz
}

function removeOutliers(values: number[], denominator: number = 4, numerator = 1): number[] {
    const highestIndex = values.length - 1
    const first = Math.floor((highestIndex / denominator) * numerator)
    const last = Math.ceil((highestIndex / denominator) * (denominator - numerator))
    return values.slice(first, last)
}

function sortNumerically(values: number[]): number[] {
    return values.sort((a, b) => a - b)
}