## 根据`.env.development`中实际的`VITE_GLOB_API_URL`，拼接API-URL路径

## 每次对话结束后都询问我是否执行以下操作:

- 找到相对于上游脚手架修改的部分（我们另外追加的业务代码不算），上方添加注释 `// adapt to helium: <说明>` 方便阅读
- 补充本次对话的变更，到工程根目录的 CHANGED.MD

## id相关字段，类型统一使用string

- 用于兼容JS 16位上限，后端都会按 string 输出long
