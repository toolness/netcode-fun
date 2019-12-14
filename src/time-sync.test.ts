import { ServerTimeSynchronizer } from "./time-sync";

describe("ServerTimeSynchronizer", () => {
  let now = 0;
  let sync = new ServerTimeSynchronizer(() => now);

  beforeEach(() => {
    now = 0;
    sync = new ServerTimeSynchronizer(() => now);
  });

  it("assumes server time is same as client time by default", () => {
    expect(sync.serverNow()).toBe(0);
    now = 15;
    expect(sync.serverNow()).toBe(15);
  });

  it("accounts for lag between server and client as time passes", () => {
    sync.update(8, 10);
    expect(sync.serverNow()).toBe(14);
    now = 15;
    expect(sync.serverNow()).toBe(29);
  });

  it("ignores updates with worse RTT than we've seen", () => {
    sync.update(2, 10);
    sync.update(80, 100);
    expect(sync.serverNow()).toBe(11);
  });

  it("uses updates with better RTT than we've seen", () => {
    sync.update(80, 100);
    sync.update(2, 10);
    expect(sync.serverNow()).toBe(11);
  });

  it("remembers how many updates it's been given", () => {
    sync.update(80, 100);
    sync.update(2, 10);
    expect(sync.updates).toBe(2);
  });
});
