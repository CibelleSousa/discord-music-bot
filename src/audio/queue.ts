export class Queue {
  public tracks: any[]; // Usaremos 'any' por enquanto, depois tipamos com a música do Lavalink
  public currentTrack: any | null;
  public textChannel: any | null;
  public timeout: NodeJS.Timeout | null;
  public isManualStop: boolean;
  public requesterId: string | null;

  constructor() {
    this.tracks = [];
    this.currentTrack = null;
    this.textChannel =  null;
    this.timeout = null;
    this.isManualStop = false;
    this.requesterId = null;
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