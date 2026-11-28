本文件记录 helium-admin-ui 相对于上游 `vbenjs/vue-vben-admin` 的主要定制改动（所有改动处细节太多了，列举不完）

源码中的所有改动处都带 `// helium customization: <说明>` 注释，方便与上游 diff

## 工程精简

- 删除 `apps/backend-mock`（Nitro Mock 后端）及 `internal/vite-config` 中 nitro-mock 插件、`VITE_NITRO_MOCK` 开关、turbo/eslint 死引用、锁文件重建
- 删除 `playground` 演示工程
- 删除 `docs/`（上游 Vitepress 文档站 `@vben/docs`）及 `pnpm-workspace.yaml` 中 `docs` / `playground` 条目
- 删除演示路由/页面（`modules/demos.ts`、`views/demos/`、dashboard 分析页/工作台演示），仅保留「个人中心」
- 删除 `apps/web-antdv-next/CHANGELOG.md`（上游变更日志，定制仓库不再维护）
- 移除上游 `viteFormFieldSlotMigrationWarningPlugin`（dev serve 无条件打印 Vben Form 插槽迁移告警并向 index.html 注入 `console.warn`；仓库内已无 `v-bind="slotProps"` 旧用法，告警仅剩噪音）

## 对接真实后端

- `api/request.ts` — 响应约定对齐后端；请求头追加 `X-i18n-Lang` / `X-i18n-Timezone`
- `api/core/auth.ts` — 登录/登出对齐后端；新增登录挑战；隐藏忘记密码/手机号/扫码/第三方登录/注册入口
- `api/core/user.ts` / `menu.ts` — 对接用户中心、菜单接口
- `store/auth.ts` — 登录流程消费后端返回的 token/roles/permissions
- `adapter/vxe-table.ts` — 分页字段 `items` → `records`；新增 `CellTag` / `CellSwitch` / `CellOperation` 渲染器；表格 `size` 改 `medium`

## 路由与布局

- 默认权限模式 `frontend` → `backend`，默认主题 `dark` → `light`
- 新增 `router/routes/fixed/` 固定路由目录（glob 并入初始 routes，不受权限模式影响）：`dashboard.ts`（极简首页 Workbench，登录默认落地页）、`profile.ts`（个人中心）
- `guard.ts` — backend 模式侧边栏顶部注入固定「首页」入口
- `layouts/basic.vue` — 头像菜单仅保留「个人中心」；移除消息通知、文档站/GitHub 外链等演示内容
- 个人中心仅保留「基本设置」「修改密码」；基本设置对接后端（头像上传、资料表单）

## 内网离线

- 默认头像与 LOGO 改本地资源 `public/images/`（替代 unpkg CDN）
- 图标全部改本地 ant-design 集，消除运行时 `api.iconify.design` 请求
- `index.html` 移除百度统计脚本

## 系统管理页面

- 用户、部门、角色、菜单、数据字典（左分类右字典项）、登录日志、操作日志、租户/租户套餐、文件存储/元数据
- 启用/禁用为列表行内开关（`CellSwitch`，模态框二次确认）
- 删除二次确认统一居中模态框（`utils/confirm.ts`）
- 通用实体多选组件 `components/entity-picker/`（hook + 输入框 + 抽屉壳，跨页/筛选保持已选），用于登录日志按用户多选等场景
- 按钮权限 composable `hooks/use-page-access.ts`（`usePageAccess(prefix)` 预计算增删改布尔 + `has()` 特殊串兜底，`FULL_PAGE_ACCESS` 全放行兜底），各页面列定义/工具栏统一消费
- 各页面对应 i18n 文案（zh-CN/en-US）
- API barrel 自动同步 — `apps/web-antdv-next/scripts/gen-api-barrels.mjs`：按 `src/api` 目录现状重生成各模块 `index.ts` 与顶层 `index.ts`（新模块自动追加、失效导出自动剔除、仅追加目录不追加散文件）；dev/build 由本地 vite 插件（`vite.config.ts` `buildStart`）自动执行，亦可手动 `pnpm gen:api-barrels`；代码生成器落盘后无需再手工补 export

## 其他约定

- `api/common.ts` — 框架级通用类型（`YesOrNoEnum`、`GenderEnum`、`EnabledStatusEnum`、`PageParam` / `PageResult`）
- 接口路径不含 `/admin` 前缀（baseURL 已含）
- `lefthook.yml` — 禁用 commitlint（不强制 conventional commit）

> 备注：
> - 默认值变更（主题/权限模式）需清除浏览器 localStorage 缓存后才对已登录环境生效
> - 系统管理页面路由由后端菜单下发，需后端菜单表存在对应 `component` 字段
