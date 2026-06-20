export class Queue {
  public tracks: any[]; // Usaremos 'any' por enquanto, depois tipamos com a música do Lavalink
  public currentTrack: any | null;
  public textChannel: any | null;
  public timeout: NodeJS.Timeout | null;
  public isManualStop: boolean;
  public requesterId: string | null;
  public isShuffled: boolean;
  public unshffledTracks: any[];

  constructor() {
    this.tracks = [];
    this.currentTrack = null;
    this.textChannel =  null;
    this.timeout = null;
    this.isManualStop = false;
    this.requesterId = null;
    this.isShuffled =  false;
    this.unshffledTracks = [];
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

  public enabledShuffle(): void {
    if(this.isShuffled) return;
    this.unshffledTracks = [...this.tracks];
    this.isShuffled = true;
  }

  public disableShuffle(): void {
    if (!this.isShuffled) return;

    const remainingOriginals = this.unshffledTracks.filter(track => this.tracks.includes(track));
    const newTracks = this.tracks.filter(track => !this.unshffledTracks.includes(track));

    this.tracks = [...remainingOriginals, ...newTracks];

    this.isShuffled = false;
    this.unshffledTracks = [];
  }
}