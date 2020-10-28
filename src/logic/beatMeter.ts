export class BeatMeter {
  constructor (
        private beats: number[] = []
  ) {
    this.calculate(beats)
  }

    private period_ = 0
    public get period () {
      return this.period_
    }

    public get bpm () {
      if (this.period === 0) {
        return 0
      } else {
        return bpmFromPeriod(this.period)
      }
    }

    private offset_ = 0
    public get offset () {
      return this.offset_
    }

    public get needsMoreBeats () {
      return this.beats.length < 2
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
      this.period_ = calculatePeriod(beats)
      this.offset_ = calculateOffset(beats, this.period)
    }
}

export function bpmFromPeriod (period: number): number {
  return 60 / period
}

export function periodFromBpm (bpm: number): number {
  return 60 / bpm
}

function calculatePeriod (beats: number[]): number {
  if (beats.length <= 1) {
    return 0
  }

  const distancesWithOutliers = sortNumerically(getDistancesBetweenBeats(beats))
  const distances = removeOutliers(distancesWithOutliers)

  // Remove outliers for better error tolerance.
  const averagePeriod = distances.reduce((accu, next) => accu + next, 0) / distances.length

  return averagePeriod
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

function calculateOffset (beats: number[], period: number): number {
  if (period === 0) {
    return 0
  }

  const offsetsWithOutliers = sortNumerically(beats.map(beat => beat % period))
  const offsets = removeOutliers(offsetsWithOutliers)

  const averageOffset = offsets.reduce((accu, next) => accu + next, 0) / offsets.length
  return averageOffset / period
}

function removeOutliers (values: number[], denominator = 4, numerator = 1): number[] {
  const highestIndex = values.length
  const first = Math.floor((highestIndex / denominator) * numerator)
  const last = Math.ceil((highestIndex / denominator) * (denominator - numerator))
  return values.slice(first, last)
}

function sortNumerically (values: number[]): number[] {
  return values.sort((a, b) => a - b)
}
