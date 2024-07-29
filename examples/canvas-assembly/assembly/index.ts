// empty

interface ICanvas {
  width: u64;
  height: u64;
  splash(
    node_id: string,
    offset: StaticArray<u64>,
    size: StaticArray<u64>,
    rgb: StaticArray<u64>
  ): void;
  //paint(nodeId: string, offset: [u64, u64], rgb: [u64, u64, u64]): void;
  //pixel(x: number, y: number): IPixel;
}

class Canvas implements ICanvas {
  width: u64;
  height: u64;

  constructor(width: u64, height: u64) {
    this.width = width;
    this.height = height;
  }

  splash(
    node_id: string,
    offset: StaticArray<u64>,
    size: StaticArray<u64>,
    rgb: StaticArray<u64>
  ): void {
    //console.log("Splash", node_id, offset, size, rgb);
  }

  //paint(nodeId: string, offset: [u64, u64], rgb: [u64, u64, u64]): void {
  //  this.pixel(offset[0], offset[1]).paint(nodeId, rgb);
  //}

  //pixel(x: number, y: number): IPixel {
  //  return new Pixel(`${x}-${y}`);
  //}
}
