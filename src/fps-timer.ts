export class FPSTimer {
  private readonly idealDelta: number;
  private _frame: number;
  private totalDelta: number;
  private start: number;
  private timeout: any;

  constructor(
    readonly fps: number,
    readonly callback: () => void,
    readonly now: () => number,
    readonly syncWithStartTime?: number,
  ) {
    const currTime = now();
    const virtualStartTime = syncWithStartTime ?? currTime;
    const timeSinceVirtualStartTime = currTime - virtualStartTime;

    this.idealDelta = 1000 / fps;

    const msSinceLastFrame = Math.abs(timeSinceVirtualStartTime % this.idealDelta);
    const msToNextFrame = this.idealDelta - msSinceLastFrame;

    this.start = currTime - msSinceLastFrame;
    this._frame = 0;
    this.totalDelta = 0;
    this.next = this.next.bind(this);
    this.timeout = setTimeout(this.next, msToNextFrame);
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
