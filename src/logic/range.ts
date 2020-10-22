export class Range {
    private start_: number;
    private duration_: number;

    constructor (
      start: number,
      duration: number
    ) {
      this.start_ = Math.max(0, start)
      this.duration_ = Math.max(0, duration)
    }

    public static fromStartAndEnd (start: number, end: number): Range | null {
      if (start < end) {
        const duration = end - start
        return new Range(start, duration)
      } else {
        return null
      }
    }

    public get start () {
      return this.start_
    }

    public set start (newStart: number) {
      this.start_ = this.sanitizeInput(newStart, this.start)
    }

    public get duration () {
      return this.duration_
    }

    public set duration (newDuration: number) {
      this.duration_ = this.sanitizeInput(newDuration, this.duration)
    }

    public get end () {
      return this.start + this.duration
    }

    public set end (newEnd: number) {
      const newDuration = newEnd - this.start
      if (newDuration >= 0) {
        this.duration = newDuration
      } else {
        this.start = this.start + newDuration // newDuration is negative.
        this.duration = 0
      }
    }

    private sanitizeInput (newValue: number, oldValue: number) {
      if (!isNaN(newValue)) {
        return Math.max(0, newValue)
      } else {
        return oldValue
      }
    }
}
