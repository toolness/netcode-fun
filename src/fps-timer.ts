export class FPSTimer {
  private readonly idealDelta: number;
  private _frame: number;
  private totalDelta: number;
  private start: number;
  private timeout: any;

  constructor(
    readonly fps: number,
    readonly callback: () => void,
    readonly now: () => number
  ) {
    this.idealDelta = 1000 / fps;
    this.start = this.now();
    this._frame = 0;
    this.totalDelta = 0;
    this.next = this.next.bind(this);
    this.timeout = setTimeout(this.next, this.idealDelta);
  }

  private next() {
    this._frame++;
    this.callback();
    const now = this.now();
    const idealNow = this.start + this._frame * this.idealDelta;
    const delta = now - idealNow;
    this.totalDelta += Math.abs(delta);
    this.timeout = setTimeout(this.next, Math.max(this.idealDelta - delta, 0));
    // if (this._frame % this.fps === 0) console.log(this._frame, Math.floor(now), this.averageDelta);
  }

  get frame() {
    return this._frame;
  }

  get averageDelta() {
    return this.totalDelta / this._frame;
  }

  stop() {
    clearTimeout(this.timeout);
  }
}
