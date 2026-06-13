export class Queue {
  public tracks: any[]; // Usaremos 'any' por enquanto, depois tipamos com a música do Lavalink
  public currentTrack: any | null;

  constructor() {
    this.tracks = [];
    this.currentTrack = null;
  }

  public enqueue (track: any): void {
    this.tracks.push(track);
  }

  public next(): any | null {
    if (this.tracks.length === 0) {
        this.currentTrack = null;
        return null
    }

    const nextTrack = this.tracks.shift();
    this.currentTrack = nextTrack;

    return nextTrack;
  }
}