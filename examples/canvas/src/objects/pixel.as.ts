import { GCounter } from "@topology-foundation/crdt";
import { TopologyObject } from "@topology-foundation/object";

export interface IPixel extends TopologyObject {
  red: GCounter;
  green: GCounter;
  blue: GCounter;
  color(): StaticArray<u64>;
  paint(nodeId: string, rgb: StaticArray<u64>): void;
  counters(): StaticArray<GCounter, GCounter, GCounter>;
  merge(peerPixel: IPixel): void;
}

export class Pixel extends TopologyObject implements IPixel {
  red: GCounter;
  green: GCounter;
  blue: GCounter;

  constructor(peerId: string) {
    super(peerId);
    this.red = new GCounter({});
    this.green = new GCounter({});
    this.blue = new GCounter({});
  }

  color(): StaticArray<u64> {
    return [
      this.red.value() % 256,
      this.green.value() % 256,
      this.blue.value() % 256,
    ];
  }

  paint(nodeId: string, rgb: StaticArray<u64>): void {
    this.red.increment(nodeId, rgb[0]);
    this.green.increment(nodeId, rgb[1]);
    this.blue.increment(nodeId, rgb[2]);
  }

  counters(): StaticArray<GCounter> {
    return [this.red, this.green, this.blue];
  }

  merge(peerPixel: Pixel): void {
    let peerCounters = peerPixel.counters();
    this.red.merge(peerCounters[0]);
    this.green.merge(peerCounters[1]);
    this.blue.merge(peerCounters[2]);
  }
}
