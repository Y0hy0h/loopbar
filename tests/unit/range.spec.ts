import { expect } from 'chai'
import fc from 'fast-check'

import { Range } from '@/logic/range'

const MAX_SECONDS = 100_000

describe('Range', () => {
  it('all values are always non-negative', () => {
    fc.assert(
      fc.property(
        fc.record({
          start: fc.double(0, MAX_SECONDS),
          duration: fc.double(0, MAX_SECONDS),
          property: fc.oneof(
            fc.constant('start'),
            fc.constant('duration'),
            fc.constant('end')
          ),
          change: fc.oneof(fc.double(-2 * MAX_SECONDS, 2 * MAX_SECONDS), fc.constant(NaN))
        }),
        data => {
          const range = Range.fromStartAndDuration(data.start, data.duration)

          switch (data.property) {
            case 'start': {
              range.setStart(range.start + data.change)
              break
            }
            case 'duration': {
              range.setDurationByShiftingEnd(range.duration + data.change)
              break
            }
            default: {
              range.setEnd(range.end + data.change)
            }
          }

          expect(range.start).to.be.at.least(0)
          expect(range.duration).to.be.at.least(0)
          expect(range.end).to.be.at.least(0)
        }
      )
    )
  })
})
