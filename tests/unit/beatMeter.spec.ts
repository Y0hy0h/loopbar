import { expect } from 'chai'

import { BeatMeter } from '@/logic/beatMeter'

describe('BeatMeter', () => {
  it('handles perfectly spaced beats', () => {
    const beatMeter = new BeatMeter()

    beatMeter.addBeats(0.5, 1.5, 2.5, 3.5)

    expect(beatMeter.period).to.equal(1)
    expect(beatMeter.bpm).to.equal(60)
    expect(beatMeter.offset).to.equal(0.5)
  })

  it('averages out inconsistent beats', () => {
    const beatMeter = new BeatMeter([
      0.5, 2.5, 4.5, 6.5
    ])

    expect(beatMeter.period).to.approximately(2, 0.01)
    expect(beatMeter.offset).to.approximately(0.25, 0.001)
  })

  it('adds perfectly spaced beats without change', () => {
    const beatMeter = new BeatMeter([0, 1, 2, 3])

    beatMeter.addBeats(4, 5, 6, 7)

    expect(beatMeter.period).to.equal(1)
    expect(beatMeter.offset).to.equal(0)
  })

  it('ignores outliers', () => {
    const beatMeter = new BeatMeter([0, 100, 101, 102, 103, 104, 105, 106, 1000])

    expect(beatMeter.period).to.equal(1)
    expect(beatMeter.offset).to.equal(0)
  })

  it('does not produce NaNs when given a single beat', () => {
    const beatMeter = new BeatMeter([0])

    expect(beatMeter.period).to.equal(0)
    expect(beatMeter.bpm).to.equal(0)
    expect(beatMeter.offset).to.equal(0)
  })
})
