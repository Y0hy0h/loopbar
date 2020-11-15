export interface Ranged {
    getStart(): number;
    getEnd(): number;
    getDuration(): number;
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
          return this.items.splice(precedingIndex, itemsToDelete, newItem)
        } else {
          return [newItem]
        }
      } else {
        return this.items.splice(precedingIndex, itemsToDelete, newItem)
      }
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
