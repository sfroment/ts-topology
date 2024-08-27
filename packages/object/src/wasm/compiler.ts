/* Logic for compiling Topology CROs to wasm and extracting:
    - Bytecode
    - ABI
*/
import * as fs from "fs";
import * as path from 'path';
import asc from "assemblyscript/asc";
import * as packedFile from "@topology-foundation/crdt/src-export"

function writeObjectToDirectory(targetDir: string, structure: any) {
  fs.mkdirSync(targetDir, { recursive: true });

  Object.keys(structure).forEach((key: string) => {
    const value = structure[key];
    const targetPath = path.join(targetDir, key);

    if (typeof value === 'string') { // file
      fs.writeFileSync(targetPath, value);
    } else if (typeof value === 'object' && value !== null) { // directory
      writeObjectToDirectory(targetPath, value);
    }
  });
}

export function loadDeps() {
  writeObjectToDirectory("/node_modules/@topology-foundation/crdt/src", packedFile.src);
}

export async function compileWasm(path: string) {

  const { error, stderr } = await asc.main([
    path,
    "--bindings=esm",
    "--outFile=/tmp/dist.wasm",
  ], {
    readFile: (filename: string) => {
      console.log("testing", filename)
      if (!fs.existsSync(filename)) return null;
      return fs
        .readFileSync(filename, "utf8")
        .replace(
          "@topology-foundation/crdt",
          "@topology-foundation/crdt/src/index.asc",
        );
    },
    writeFile: (
      filename: string,
      contents: string | Uint8Array,
      baseDir: string,
    ) => fs.writeFileSync(filename, contents),
    listFiles: () => []
  });

  if (error) {
    console.log(`Compilation failed: ${error}`);
    console.log(stderr.toString());
    return new Uint8Array();
  }

  // read tmp file into uint8array
  const bytecode: Uint8Array = new Uint8Array(
    fs.readFileSync("/tmp/dist.wasm"),
  );
  // fs.unlinkSync('dist/tmp.wasm');
  console.log("Compilation successful", bytecode);
  return bytecode;
}
