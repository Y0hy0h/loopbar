import { Range } from '@/logic/range'

export interface Ranged {
    getStart(): number;
    getEnd(): number;
    getDuration(): number;
}

export class Loop implements Ranged {
  // eslint-disable-next-line no-useless-constructor
  constructor (public range: Range, public title: string) {}

  getStart (): number {
    return this.range.getStart()
  }

  getEnd (): number {
    return this.range.getEnd()
  }

  getDuration (): number {
    return this.range.getDuration()
  }
}

export class Track<T extends Ranged> {
    private items_: T[] = []

    public get items () {
      return this.items_
    }

    public insert (newItem: T): T[] {
      let precedingIndex = 0
      for (precedingIndex; precedingIndex < this.items.length; precedingIndex++) {
        const candidate = this.items[precedingIndex]
        if (candidate.getEnd() > newItem.getStart()) {
          break
        }
      }

      let followingIndex = precedingIndex
      for (followingIndex; followingIndex < this.items.length; followingIndex++) {
        const candidate = this.items[followingIndex]
        if (candidate.getStart() >= newItem.getEnd()) {
          break
        }
      }

      const itemsToDelete = followingIndex - precedingIndex
      if (itemsToDelete === 0) {
        return this.items.splice(precedingIndex, 0, newItem)
      } else {
        const firstOverlap = this.items[precedingIndex]
        if (firstOverlap.getStart() < newItem.getStart()) {
          // If the existing item start earlier than the new item,
          // move the new item to the next track.
          return [newItem]
        } else if (firstOverlap.getStart() === newItem.getStart()) {
          if (firstOverlap.getEnd() > newItem.getEnd()) {
            // If the new item is shorter than the existing
            // (then there is only one overlapping item),
            // move the new item to the new track.
            return [newItem]
          } else {
            // If the new item is longer than or equal to the existing ones,
            // move those to the new track.
            return this.items.splice(precedingIndex, itemsToDelete, newItem)
          }
        } else {
          // If the existing items start later,
          // move them to a new track.
          return this.items.splice(precedingIndex, itemsToDelete, newItem)
        }
      }
    }

    public removeAtIndex (index: number) {
      this.items.splice(index, 1)
    }
}

export class TrackStack<T extends Ranged> {
    private tracks_: Track<T>[] = [new Track()]

    public get tracks () {
      return this.tracks_
    }

    insert (newItem: T) {
      let overlaps = [newItem]

      for (const track of this.tracks) {
        const newOverlaps = overlaps.flatMap(overlap => track.insert(overlap))

        overlaps = newOverlaps
        if (newOverlaps.length === 0) {
          break
        }
      }

      if (overlaps.length > 0) {
        const newTrack = new Track<T>()
        overlaps.forEach(item => {
          newTrack.insert(item)
        })
        this.tracks.push(newTrack)
      }
    }
}
