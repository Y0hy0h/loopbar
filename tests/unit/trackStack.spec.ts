import { expect } from 'chai'

import { TrackStack } from '@/logic/trackStack'
import { Range } from '@/logic/range'

describe('TrackStack', () => {
  it('sorts items', () => {
    const stack = new TrackStack()

    const range1 = Range.fromStartAndEnd(1, 2)
    const range2 = Range.fromStartAndEnd(2, 3)
    const range3 = Range.fromStartAndEnd(3, 4)

    stack.insert(range3)
    stack.insert(range1)
    stack.insert(range2)

    expect(stack.tracks.length).to.equal(1)
    expect(stack.tracks[0].items).to.deep.equal([range1, range2, range3])
  })

  it('allows duplicate ranges', () => {
    const stack = new TrackStack()

    const range1 = Range.fromStartAndEnd(1, 2)
    const range2 = Range.fromStartAndEnd(2, 3)

    stack.insert(range1)
    stack.insert(range2)
    stack.insert(range1)

    expect(stack.tracks.length).to.equal(2)
    expect(stack.tracks[0].items).to.deep.equal([range1, range2])
    expect(stack.tracks[1].items).to.deep.equal([range1])
  })

  it('adds non-overlapping ranges into one track', () => {
    const stack = new TrackStack()

    stack.insert(Range.fromStartAndEnd(1, 2))
    stack.insert(Range.fromStartAndEnd(2, 3))
    stack.insert(Range.fromStartAndEnd(3, 4))

    expect(stack.tracks.length).to.equal(1)
  })

  it('moves overlaps into new track', () => {
    const stack = new TrackStack()

    const range1 = Range.fromStartAndEnd(1, 2)
    const range2 = Range.fromStartAndEnd(2, 3)
    const range3 = Range.fromStartAndEnd(3, 4)
    const rangeBig = Range.fromStartAndEnd(1, 3)

    stack.insert(range1)
    stack.insert(range2)
    stack.insert(range3)
    stack.insert(rangeBig)

    expect(stack.tracks.length).to.equal(2)
    expect(stack.tracks[0].items).to.deep.equal([rangeBig, range3])
    expect(stack.tracks[1].items).to.deep.equal([range1, range2])
  })

  it('moves the item with the later start to a new track', () => {
    const stack = new TrackStack()

    const range1 = Range.fromStartAndEnd(1, 3)
    const range2 = Range.fromStartAndEnd(2, 5)
    const range3 = Range.fromStartAndEnd(5, 6)

    stack.insert(range2)
    stack.insert(range3)
    stack.insert(range1)

    expect(stack.tracks.length).to.equal(2)
    expect(stack.tracks[0].items).to.deep.equal([range1, range3])
    expect(stack.tracks[1].items).to.deep.equal([range2])
  })

  it('moves the smaller item to a new track', () => {
    const stack = new TrackStack()

    const range1 = Range.fromStartAndEnd(1, 2)
    const range2 = Range.fromStartAndEnd(2, 3)
    const rangeBig = Range.fromStartAndEnd(1, 3)

    stack.insert(range1)
    stack.insert(rangeBig)
    stack.insert(range2)

    expect(stack.tracks.length).to.equal(2)
    expect(stack.tracks[0].items).to.deep.equal([rangeBig])
    expect(stack.tracks[1].items).to.deep.equal([range1, range2])
  })
})
