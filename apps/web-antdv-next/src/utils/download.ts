/**
 * 浏览器端文件下载工具
 */

/**
 * 触发浏览器保存 Blob 为文件
 * @param blob 文件内容
 * @param filename 保存文件名
 */
export function saveBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

/**
 * 从 Content-Disposition 响应头解析文件名
 * <p>兼容 RFC 5987 filename* 与普通 filename 两种形式，解析失败回退默认名
 * @param disposition Content-Disposition 响应头
 * @param fallback 解析失败时的回退文件名
 */
export function parseFilenameFromDisposition(
  disposition: null | string,
  fallback: string,
): string {
  if (!disposition) return fallback;
  // RFC 5987：filename*=UTF-8''xxx（后端 ExcelResponseUtil 下发形式）
  const starred = disposition.match(/filename\*=(?:UTF-8|utf-8)''([^;]+)/);
  if (starred?.[1]) {
    try {
      return decodeURIComponent(starred[1]);
    } catch {
      // 编码异常时走回退
    }
  }
  // 普通 filename 形式（后端下发 percent-encode 后的 UTF-8 文件名）
  const plain = disposition.match(/filename="?([^";]+)"?/);
  if (plain?.[1]) {
    try {
      return decodeURIComponent(plain[1]);
    } catch {
      // 编码异常时走回退
    }
  }
  return fallback;
}
