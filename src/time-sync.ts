/**
 * A class for synchronizing time with the server, based on
 * Cristian's algorithm: https://en.wikipedia.org/wiki/Cristian%27s_algorithm
 */
export class ServerTimeSynchronizer {
  private bestRTT: number = Infinity;
  private bestServerTime: number;
  private bestClientTime: number;
  private _updates: number = 0;

  constructor(readonly now: () => number = () => performance.now()) {
    this.bestServerTime = now();
    this.bestClientTime = now();
  }

  get updates() {
    return this._updates;
  }

  update(roundTripTime: number, serverTime: number) {
    this._updates += 1;
    if (roundTripTime < this.bestRTT) {
      this.bestRTT = roundTripTime;
      this.bestServerTime = serverTime + roundTripTime / 2;
      this.bestClientTime = this.now();
    }
  }

  serverNow() {
    const timePassed = this.now() - this.bestClientTime;
    return this.bestServerTime + timePassed;
  }
}
