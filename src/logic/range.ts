import { Ranged } from './trackStack'

export class Range implements Ranged {
  private start_: number;
  private end_: number;

  public get start () {
    return this.start_
  }

  public get duration () {
    return this.end - this.start
  }

  public get end () {
    return this.end_
  }

  private constructor (
    start: number,
    end: number
  ) {
    this.start_ = Math.max(0, start)
    this.end_ = Math.max(this.start, end)
  }

  public static fromStartAndDuration (start: number, duration: number): Range {
    const end = start + duration
    return new Range(start, end)
  }

  public static fromStartAndEnd (start: number, end: number): Range {
    return new Range(start, end)
  }

  setStart (newStart: number) {
    this.start_ = this.sanitizeInput(newStart, this.start)
    if (this.end < this.start) {
      this.setEnd(this.start)
    }
  }

  /**
   * @param newDuration The new duration. If not a non-negative number, the range is not changed.
   */
  setDurationByShiftingEnd (newDuration: number) {
    if (newDuration >= 0) { // NaN does not satisfy this condition.
      this.setEnd(this.start + newDuration)
    }
  }

  setEnd (newEnd: number) {
    this.end_ = this.sanitizeInput(newEnd, this.end)
    if (this.start > this.end) {
      this.setStart(this.end)
    }
  }

  /**
   * Shifts the entire range, preserving its duration.
   *
   * The start will never be shifted below 0.
   *
   * @param offset The units to offset the range by.
   */
  shift (offset: number) {
    const newStart = this.start + offset
    if (newStart >= 0) { // If the shift is inside the bounds.
      const newEnd = this.end + offset
      this.setStart(newStart)
      this.setEnd(newEnd)
    } else { // If the shift goes below 0.
      const oldDuration = this.duration
      this.setStart(0)
      this.setEnd(oldDuration)
    }
  }

  getStart (): number {
    return this.start
  }

  getEnd (): number {
    return this.end
  }

  getDuration (): number {
    return this.duration
  }

  private sanitizeInput (newValue: number, oldValue: number, min = 0) {
    if (!isNaN(newValue)) {
      return Math.max(min, newValue)
    } else {
      return oldValue
    }
  }
}
