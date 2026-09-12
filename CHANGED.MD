# 相对于上游的变更

本文件记录本二次开发分支（helium）相对于上游 `vbenjs/vue-vben-admin` 的定制改动，按「删除 / 修改 / 增加」分类。

> 二次开发目标：移除上游内置 Mock 后端，全部接口对接自研后端（OpenAPI 见根目录 `swagger.json`，服务地址 `http://127.0.0.1:7003`）。

### 删除目录

- `apps/backend-mock` — 上游内置的 Nitro Mock 后端工程（全部接口 mock）

### 删除文件

- `internal/vite-config/src/plugins/nitro-mock.ts` — Nitro Mock 的 vite 插件实现

### 修改文件

- `apps/web-antdv-next/.env.development` — 移除 `VITE_NITRO_MOCK` 开关
- `apps/web-antdv-next/vite.config.ts` — 开发代理 `/api` 目标由 mock（`localhost:5320/api`）改为真实后端（`127.0.0.1:7003`）
- `apps/web-antdv-next/src/api/request.ts` — 响应体约定对齐后端：成功判定 `code===0` → `success===true`，错误信息字段 `error/message` → `msg`；`doRefreshToken` 改空占位（后端无刷新接口）
- `apps/web-antdv-next/src/api/core/auth.ts` — 登录 `POST /auth/login` → `POST /admin/v1/auth/password-login`，登出 → `/admin/v1/auth/logout`；入参改 `pin/pwd`（+tenantCode/captcha），返回 `token/roles/permissions`
- `apps/web-antdv-next/src/api/core/user.ts` — `GET /user/info` → `POST /admin/v1/ucenter/profile/get`，`MyProfileDTO` 映射为前端 `UserInfo`
- `apps/web-antdv-next/src/api/core/menu.ts` — `GET /menu/all` → `POST /admin/v1/sys/menu/side`，新增 `transformMenus` 将扁平 `SysMenuDTO` 转为路由树
- `apps/web-antdv-next/src/store/auth.ts` — 登录流程改为消费后端返回的 `token/roles/permissions`，用户资料拉取容错
- `apps/web-antdv-next/src/views/_core/authentication/login.vue` — 移除上游 mock 账号下拉选择器（`MOCK_USER_OPTIONS`）及其自动填充逻辑
- `apps/web-antdv-next/src/preferences.ts` — 默认权限模式 `frontend` → `backend`，默认主题 `dark` → `light`
- `apps/web-antdv-next/src/adapter/vxe-table.ts` — 新增 `CellTag` / `CellSwitch` / `CellOperation` 单元格渲染器、操作按钮回调类型，及热更新渲染器清理；表格全局 `size` `small` → `medium`（字号加大一档，对老年用户更友好）
- `internal/vite-config/src/config/application.ts` — 移除 `nitroMock` / `nitroMockOptions` 选项
- `internal/vite-config/src/plugins/index.ts` — 移除 `viteNitroMockPlugin` 的 import / 选项 / 条件加载块
- `internal/vite-config/src/typing.ts` — 移除 `NitroMockPluginOptions` 类型与选项字段
- `internal/vite-config/src/utils/env.ts` — 移除 `VITE_NITRO_MOCK` 读取与 `nitroMock` 字段
- `internal/lint-configs/eslint-config/src/configs/node.ts` — 死 glob 移除 `apps/backend-mock/**/**`
- `internal/lint-configs/eslint-config/src/custom-config.ts` — 死 glob 移除 `apps/backend-mock/**/**`
- `turbo.json` — 移除 `@vben/backend-mock#build` 任务
- `lefthook.yml` — 禁用 `commit-msg` 的 commitlint 校验（不再强制 conventional commit）
- `pnpm-lock.yaml` — 重建（移除 mock 相关依赖）
- `apps/web-antdv-next/src/router/routes/modules/dashboard.ts` — `/dashboard` 加 `redirect: '/dashboard/workbench'`；新增极简首页 `Workbench` 子路由（首位、`affixTab`、`order:1`）；移除 `Analytics` 的 `affixTab`（后移至 `fixed/dashboard.ts`，见下）
- `apps/web-antdv-next/src/router/routes/index.ts` — 新增 `fixed/` 固定路由目录：glob 合并后直接并入初始 `routes` 数组，始终注册、不受权限模式影响（backend 模式下 `modules/` 不注册导致 `/dashboard` 404）
- `apps/web-antdv-next/src/router/guard.ts` — backend 模式菜单只来自后端，前端在侧边栏顶部注入固定「首页」入口（`/dashboard/workbench`，`order: -1`）
- `apps/web-antdv-next/src/locales/langs/zh-CN/page.json` — `page.dashboard.workbench.*` 中性文案（问候/引导/版本）
- `apps/web-antdv-next/src/locales/langs/en-US/page.json` — 对应英文文案
- `apps/web-antdv-next/src/api/core/auth.ts`、`user.ts`、`menu.ts` — 接口路径去掉重复的 `/admin` 前缀（baseURL `VITE_GLOB_API_URL` 已含 `/admin`，axios 拼接原会双前缀 `/admin/admin/v1/...`）
- `apps/web-antdv-next/src/adapter/vxe-table.ts` — proxyConfig 分页结果字段 `items` → `records`（对齐后端 `PageResult`）
- `apps/web-antdv-next/src/api/index.ts` — 新增 `export * from './system'`

> 修改的文件中，相对源项目改动的位置会在上方添加注释 `// adapt to helium: <说明>`（配置文件用对应注释语法），方便与上游比较。

### 增加文件

- `apps/web-antdv-next/src/router/routes/fixed/dashboard.ts` — 原 `modules/dashboard.ts` 移入固定路由目录，顶层加 `BasicLayout` 容器；backend 权限模式下始终注册，修复 `/dashboard` 404
- `swagger.json` — 后端 OpenAPI 定义，作为前端对接依据（非构建产物）
- `CHANGED.MD` — 本变更说明
- `apps/web-antdv-next/src/views/dashboard/workbench/index.vue` — 极简首页（问候+引导+版本，无 mock 数据），作为登录后默认落地页
- `apps/web-antdv-next/src/api/sys/SysRole.ts` — 角色管理接口（`/v1/sys/role/*`：list/detail/create/update/update-status/delete/bind-menu，`pageParam` 嵌套分页，`PageResult` 返回）
- `apps/web-antdv-next/src/api/sys/menu.ts` — `getVisibleMenuList`（`/v1/sys/menu/visible`）+ `buildMenuTree`（扁平 `SysMenuDTO` 建 `parentId` 树）
- `apps/web-antdv-next/src/api/common.ts` — 通用类型（`EnabledStatusEnum` / `PageParam` / `PageResult`）
- `apps/web-antdv-next/src/views/sys/SysRole/` — 角色管理页面：`index.vue`（vxe 表格分页/搜索/删除，操作列含授权入口）、`data.ts`（表单/列配置）、`modules/form.vue`（纯基础信息新增/编辑抽屉）、`modules/bind-menu.vue`（授权抽屉：功能权限/角色用户 Tab、节点关联/独立、折叠/展开、刷新、树表格勾选列+菜单列+权限列内联按钮，底部确认=保存权限）
- `apps/web-antdv-next/src/locales/langs/zh-CN/system.json`、`en-US/system.json` — `system.role.*` 文案（含授权抽屉 `grantTitle/savePermissions/tab*/node*/collapse/expand/menuCol/permCol`）

### 增加包依赖

- `vue3-tree-org@^4.2.2`（`apps/web-antdv-next`）— 部门管理「组织架构图」视图渲染

### 删除包依赖

- `@vbenjs/nitro-mock` 及 `apps/backend-mock` 工程全部依赖（随 mock 工程一并移除）

> 备注：
> - 默认值变更（主题/权限模式）需清除浏览器 localStorage 缓存后才对已登录环境生效。
> - `SysMenuDTO` 无独立 `path` 字段，当前由 `component` 派生 `path`、以 slug 作路由 `name`；若与真实数据不符，调整 `transformMenus` 字段映射即可。
> - `playground/` 演示工程仍保留 mock 风格接口与指向 `localhost:5320` 的代理，未纳入本次真实后端改造。
> - 角色管理「新增后绑定菜单」依赖后端 create 接口返回新记录 ID（后端改造中）；改造完成前新增成功不弹绑定引导。
> - 角色页面路由由后端菜单下发（backend 权限模式），需后端菜单表存在 `component: /system/role/list` 的菜单记录。
> - 2026-09-12：授权（绑定菜单）从新增/编辑表单剥离，改为列表操作列独立入口；授权抽屉按设计图重做（Tab/工具栏/树表格/底部保存），新增成功不再弹绑定引导，「角色用户」Tab 为空态占位（后端接口待建）。
> - 2026-09-12：部门管理新增「列表视图 / 组织架构图」切换（`views/sys/dept/index.vue`）：切换按钮独立于表格工具栏外、页面左上（架构图视图下仍可切回）；架构图用 `vue3-tree-org` 渲染、仅查看（可折叠/缩放），跟随本地搜索过滤，与列表共享同一份树数据（proxy query 时同步），样式适配亮/暗主题；新增文案 `sys.dept.viewTable` / `viewTree`。
> - 更早的提交（`b0a9367f8` 清理不需要的文件、`2af53c1b6` 删除除 `web-antdv-next` 外的子工程）已先行精简仓库，此处不再展开。
