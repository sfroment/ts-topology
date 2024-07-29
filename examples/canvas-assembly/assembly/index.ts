// empty

// Define SHA-256 constants
const K: u32[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

// Initial hash values
let H: u32[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
  0x1f83d9ab, 0x5be0cd19,
];

// Right rotate function
function rotr(n: u32, x: u32): u32 {
  return (x >>> n) | (x << (32 - n));
}

// SHA-256 padding
function padMessage(message: Uint8Array): Uint8Array {
  let len = message.length;
  let bitLen = len * 8;
  let paddingLen = (bitLen + 64) % 512;
  paddingLen = paddingLen < 448 ? 448 - paddingLen : 960 - paddingLen;

  let padded = new Uint8Array(len + paddingLen / 8 + 8);
  padded.set(message);
  padded[len] = 0x80;

  let bitLenBytes = new DataView(new ArrayBuffer(8));
  bitLenBytes.setUint32(4, bitLen, false); // Big-endian
  padded.set(
    new Uint8Array(bitLenBytes.buffer.byteLength),
    len + paddingLen / 8
  );
  return padded;
}

// SHA-256 compression function
function processChunk(chunk: Uint8Array): void {
  let w = new Uint32Array(64);
  let view = new DataView(chunk.buffer);

  for (let i = 0; i < 16; i++) {
    w[i] = view.getUint32(i * 4, false);
  }

  for (let i = 16; i < 64; i++) {
    let s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
    let s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
    w[i] = w[i - 16] + s0 + w[i - 7] + s1;
  }

  let a = H[0],
    b = H[1],
    c = H[2],
    d = H[3];
  let e = H[4],
    f = H[5],
    g = H[6],
    h = H[7];

  for (let i = 0; i < 64; i++) {
    let S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
    let ch = (e & f) ^ (~e & g);
    let temp1 = h + S1 + ch + K[i] + w[i];
    let S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
    let maj = (a & b) ^ (a & c) ^ (b & c);
    let temp2 = S0 + maj;

    h = g;
    g = f;
    f = e;
    e = d + temp1;
    d = c;
    c = b;
    b = a;
    a = temp1 + temp2;
  }

  H[0] = H[0] + a;
  H[1] = H[1] + b;
  H[2] = H[2] + c;
  H[3] = H[3] + d;
  H[4] = H[4] + e;
  H[5] = H[5] + f;
  H[6] = H[6] + g;
  H[7] = H[7] + h;
}

// Main SHA-256 function
function sha256(message: Uint8Array): Uint8Array {
  let paddedMessage = padMessage(message);
  for (let i = 0; i < paddedMessage.length; i += 64) {
    processChunk(paddedMessage.subarray(i, i + 64));
  }
  let hash = new Uint8Array(32);
  let view = new DataView(hash.buffer);
  for (let i = 0; i < 8; i++) {
    view.setUint32(i * 4, H[i], false);
  }
  return hash;
}

function stringToUint8Array(str: string): Uint8Array {
  return Uint8Array.wrap(String.UTF8.encode(str));
}

// Helper function to convert Uint8Array to hexadecimal string
function toHex(array: Uint8Array): string {
  let hex: string = "";
  for (let i = 0; i < array.length; i++) {
    let byte = array[i];
    hex += (byte < 16 ? "0" : "") + byte.toString(16);
  }
  return hex;
}

// Function to generate the ID using SHA-256
function generateId(abi: string, peerId: string): string {
  // Generate a random nonce
  let randomNonce = Math.floor(Math.random() * 1e9).toString(); // Use a range like 1e9 to avoid too large numbers

  // Convert strings to Uint8Array
  let abiBytes = stringToUint8Array(abi);
  let peerIdBytes = stringToUint8Array(peerId);
  let nonceBytes = stringToUint8Array(randomNonce);

  // Concatenate all Uint8Array inputs into one
  let combinedLength = abiBytes.length + peerIdBytes.length + nonceBytes.length;
  let combined = new Uint8Array(combinedLength);
  combined.set(abiBytes, 0);
  combined.set(peerIdBytes, abiBytes.length);
  combined.set(nonceBytes, abiBytes.length + peerIdBytes.length);

  // Calculate the SHA-256 hash
  let hash = sha256(combined);

  // Convert the hash to a hexadecimal string
  return toHex(hash);
}

abstract class TopologyObject {
  // TODO generate functions from the abi
  private abi: string;
  private id: string;

  constructor(peerId: string) {
    this.abi = "";

    // id = sha256(abi, peer_id, random_nonce)
    this.id = generateId("", peerId);
  }

  getObjectAbi(): string {
    return this.abi ? this.abi : "";
  }

  getObjectId(): string {
    return this.id ? this.id : "";
  }

  abstract merge(other: TopologyObject): void;
}

interface IPixel {}

class Pixel extends TopologyObject implements IPixel {
  constructor(peerId: string) {
    super(peerId);
    //this.red = new GCounter({});
    //this.green = new GCounter({});
    //this.blue = new GCounter({});
  }

  color(): StaticArray<u64> {
    return [
      //this.red.value() % 256,
      //this.green.value() % 256,
      //this.blue.value() % 256,
    ];
  }

  merge(peerPixel: Pixel): void {
    //let peerCounters = peerPixel.counters();
    //this.red.merge(peerCounters[0]);
    //this.green.merge(peerCounters[1]);
    //this.blue.merge(peerCounters[2]);
  }
}

export function newPixel(): Pixel {
  return new Pixel("peerId");
}
