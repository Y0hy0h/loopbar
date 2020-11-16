import { Range } from '@/logic/range'

export interface Ranged {
    getStart(): number;
    getEnd(): number;
    getDuration(): number;
}

export interface Selection {
  track: number;
  item: number;
}

export class Loop implements Ranged {
  // eslint-disable-next-line no-useless-constructor
  constructor (public range: Range, public title?: string) {}

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
      if (itemsToDelete === 1) {
        const overlap = this.items[precedingIndex]
        if (overlap.getDuration() < newItem.getDuration()) {
          // If the newItem is bigger than the overlapping item.
          return this.items.splice(precedingIndex, itemsToDelete, newItem)
        } else if (overlap.getStart() === newItem.getStart() && overlap.getEnd() === newItem.getEnd()) {
          // If there already is an item with the same range.
          return []
        } else {
          // If the newItem is shorter than the overlapping item.
          return [newItem]
        }
      } else {
        return this.items.splice(precedingIndex, itemsToDelete, newItem)
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

    /**
     * @param trackIndex The index of the track where the item to remove is in.
     * @param itemIndex The index of the item inside its track.
     */
    public removeAtIndex (trackIndex: number, itemIndex: number) {
      this.tracks[trackIndex].removeAtIndex(itemIndex)
    }
}
