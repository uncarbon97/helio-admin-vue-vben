# Helium Admin UI

基于 [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) **5.x** 二次开发的管理前端，Helium 全家桶的前端成员。

- 技术栈：Vue 3 + Vite + TypeScript + Ant Design Vue（antdv-next）+ pnpm monorepo + Turborepo
- 唯一业务子工程：`apps/web-antdv-next`，对接后端 `admin-api`（`/admin/v1/**`），不含上游 Mock 后端
- 后端权限模式：路由与按钮权限完全由后端菜单树下发
- 多租户、国际化（语言 / 时区随请求头传后端）、离线内网友好（无 CDN 外链）

📖 完整文档：[文档站 · 管理前端](https://helium.uncarbon.cc/admin-ui/)

## 快速启动

前置：Node.js `^24`、pnpm `>= 11`，后端已启动并监听 `7003`。

```bash
corepack enable        # 让 pnpm 版本自动对齐 packageManager 字段
pnpm install
pnpm dev               # 唯一子工程 apps/web-antdv-next
```

打开 `http://localhost:5999/`（端口由 `apps/web-antdv-next/.env.development` 的 `VITE_PORT=5999` 决定）。

### 接口地址

```bash
# apps/web-antdv-next/.env.development
VITE_GLOB_API_URL=http://127.0.0.1:7003/admin
```

注意末尾的 `/admin`：`src/api/**` 里的路径一律写成 `/v1/sys/role/list` 这种**不带 `/admin`** 的形式，两边都带会变成 `/admin/admin/v1/...` 直接 404。

### 首次登录

账号 `admin` / 密码 `admin`；验证码默认为后端 OCR 图形验证码，点击图片刷新。租户编码输入框是否显示由后端 `ui-config` 接口决定。

> ⚠️ 上线前务必修改 admin 密码。

## 目录速览

```text
apps/web-antdv-next/src/
├── adapter/      vben 适配层：form / vxe-table 渲染器
├── api/          接口层（按后端业务域分包）
├── components/   通用业务组件
├── locales/      国际化文案（zh-CN / en-US）
├── router/       路由（core / fixed + 后端动态下发）
├── store/        状态存储
└── views/        Vue 视图（sys / tenant / file / dashboard / _core）
```

业务页面模板以 `src/views/sys/role/` 为蓝本（列表页 + `data.ts` + `modules/form.vue`），新增页面推荐用 `helium-codegen` 生成，详见[新增业务页面](https://helium.uncarbon.cc/admin-ui/add-page/)。

## 相对上游 Vben5 的改动

所有改动处均带 `// helium customization: <说明>` 注释，变更清单见 [HELIUM_CUSTOMIZATION.MD](./HELIUM_CUSTOMIZATION.MD)。

## 推荐 VSCode 插件

仓库已内置推荐清单（`.vscode/extensions.json`），打开工程时 VSCode 会提示安装。推荐：

| 插件 | 用途 |
| --- | --- |
| [Vue - Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) | Vue 3 语言支持 |
| [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) / [oxlint](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) | 代码检查 |
| [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) | 国际化：内联翻译提示、缺失 key 检查，配合 `src/locales/langs/**` 使用 |
| [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) | Tailwind 类名补全 |
| [Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify) | 图标预览（本仓库仅注册 `ant-design` 集） |
| [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv) | `.env*` 语法高亮 |
| [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) | 样式检查 |
| [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) | YAML 支持 |
| [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) | 拼写检查 |
| [CSS Variables](https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-css-variables) | CSS 变量提示 |
| [pnpm Catalog Lens](https://marketplace.visualstudio.com/items?itemName=antfu.pnpm-catalog-lens) | 在 `package.json` 中显示 catalog 版本 |

## 文档

- [快速启动](https://helium.uncarbon.cc/admin-ui/quick-start/) · [工程结构](https://helium.uncarbon.cc/admin-ui/project-structure/) · [新增业务页面](https://helium.uncarbon.cc/admin-ui/add-page/)
- [vue-vben-admin 官方文档](https://doc.vben.pro/)
