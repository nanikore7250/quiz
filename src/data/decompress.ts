// ブラウザ標準 DecompressionStream を使用（WASMなし）
// gzip → zstd への切り替えはこの関数内だけ変更すればよい
export async function decompressGzip(buffer: ArrayBuffer): Promise<string> {
  const ds = new DecompressionStream('gzip');
  const stream = new Blob([buffer]).stream().pipeThrough(ds);
  return new Response(stream).text();
}
