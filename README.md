# helio-admin-vue-vben

## 项目说明
基于[Vue Vben Admin](https://github.com/anncwb/vue-vben-admin/) 改造适配的后台管理前端模板，开箱即用

自 `1.6.0` 版本起，可跟随源项目 `main` 分支更新

[源项目官方文档](https://vvbin.cn/doc-next/)
[相较于源项目的变更](CHANGELOG_HELIO.md)


## 如何使用

1. 从 GitHub 或 Gitee 克隆项目源码，到自己的电脑上
2. 自行安装 `Node.js`14.x 或以上版本（建议通过 [nvm](https://www.runoob.com/w3cnote/nvm-manager-node-versions.html) 进行）
4. 找到根目录下的`.env.development`，根据后端的类型（单体版or微服务版），修改`VITE_GLOB_API_URL`（全局API_BASE_URL）
5. 在根目录依次执行命令行命令：
    ```
    npm install -g pnpm
    pnpm install
    npm run dev
    ```
6. 浏览器访问http://127.0.0.1:3100 ，就能看到后台管理页面了，默认账户密码`admin admin`


## License
[MIT](./LICENSE)


## 演示效果图
![](.readme_static/helio-admin-vue-vben-1.JPG)
![](.readme_static/helio-admin-vue-vben-2.JPG)
![](.readme_static/helio-admin-vue-vben-3.JPG)
