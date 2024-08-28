import * as crypto from "crypto";
import { TopologyObject } from "./proto/object_pb.js";
import { compileWasm, loadDeps } from "./wasm/compiler.js";

export * from "./proto/object_pb.js";

export function init() {
  loadDeps();
}

/* Creates a new TopologyObject */
export async function newTopologyObject(peerId: string, path: string, id?: string, abi?: string): Promise<TopologyObject> {
  const bytecode = await compileWasm(path);
  return {
    id: id ?? crypto
      .createHash("sha256")
      .update(abi ?? "")
      .update(peerId)
      .update(Math.floor(Math.random() * Number.MAX_VALUE).toString())
      .digest("hex"),
    abi: abi ?? "",
    bytecode: bytecode ?? new Uint8Array(),
    operations: []
  }
}

export async function callFn(obj: TopologyObject, fn: string, args: string[]): Promise<TopologyObject> {
  obj.operations.push({
    nonce: Math.floor(Math.random() * Number.MAX_VALUE).toString(),
    fn: fn,
    args: args
  });
  return obj;
}
