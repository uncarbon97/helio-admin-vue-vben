// helium customization: 代码生成器制品落盘后自动同步 barrel
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

const EXPORT_LINE_RE = /^\s*export\s+\*\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/;

/** 内容有变化才落盘，保证幂等（CI/已提交状态为 no-op，git 不脏） */
function writeIfChanged(file, content) {
  if (existsSync(file) && readFileSync(file, 'utf8') === content) return false;
  writeFileSync(file, content, 'utf8');
  return true;
}

/**
 * 重生成 src/api 各级 barrel：
 * - 子目录 barrel：全量重生成（纯生成物），按文件名排序
 * - 顶层 barrel：保留现有行顺序、剔除目标已失效的行、末尾追加缺失的目录导出（文件永不自动追加）
 * 返回变更文件路径列表
 */
export function run() {
  const apiDir = resolve(process.cwd(), 'src/api');
  if (!existsSync(apiDir)) {
    throw new Error(
      `[gen-api-barrels] 找不到 ${apiDir}，请在 apps/web-antdv-next 目录下执行（或用 pnpm gen:api-barrels）`,
    );
  }
  const changed = [];
  const dirNames = readdirSync(apiDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .toSorted();

  for (const name of dirNames) {
    const dir = join(apiDir, name);
    const files = readdirSync(dir, { withFileTypes: true })
      .filter(
        (e) =>
          e.isFile() &&
          e.name.endsWith('.ts') &&
          !e.name.endsWith('.d.ts') &&
          e.name !== 'index.ts',
      )
      .map((e) => e.name)
      .toSorted();
    const content = files
      .map((f) => `export * from './${f.slice(0, -3)}';\n`)
      .join('');
    const barrel = join(dir, 'index.ts');
    if (writeIfChanged(barrel, content)) changed.push(barrel);
  }

  const topBarrel = join(apiDir, 'index.ts');
  const existing = [];
  if (existsSync(topBarrel)) {
    for (const line of readFileSync(topBarrel, 'utf8').split(/\r?\n/)) {
      const m = line.match(EXPORT_LINE_RE);
      if (!m) continue;
      const spec = m[1];
      const target = spec.replace(/^\.\//, '');
      // 目录或 <target>.ts 文件存在才保留（如 ./common -> common.ts）
      if (
        !existsSync(join(apiDir, target)) &&
        !existsSync(join(apiDir, `${target}.ts`))
      ) {
        continue;
      }
      if (!existing.includes(spec)) existing.push(spec);
    }
  }
  for (const name of dirNames) {
    const spec = `./${name}`;
    if (!existing.includes(spec)) existing.push(spec);
  }
  const topContent = existing
    .map((spec) => `export * from '${spec}';\n`)
    .join('');
  if (writeIfChanged(topBarrel, topContent)) changed.push(topBarrel);

  for (const file of changed) console.warn(`[gen-api-barrels] 已更新 ${file}`);
  return changed;
}

// CLI 守卫：直接 node 执行时才自跑；被 vite.config.ts 内联 import 时不跑
if (process.argv[1]?.replaceAll('\\', '/').includes('gen-api-barrels.mjs')) {
  run();
}
