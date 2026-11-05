# 参与开发

欢迎通过 Issue（问题）说明使用场景，或提交 Pull request（合并请求）。

## 本地验证

使用 `.nvmrc` 指定的 Node.js 版本和 `package.json` 指定的 pnpm。

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm typecheck
pnpm test
pnpm build
```

涉及收益、日期、手续费或备份结构时，补充相应逻辑测试。界面改动请检查桌面和手机宽度，并提供公开示例数据截图。

## 约定

- 金额统一按 USD 计价；非美元手续费必须提供美元等值。
- 持仓快照与历史交易独立，不能隐式改变余额。
- 改变备份结构时更新版本和兼容策略。
- 不提交个人账本、备份、钱包地址、凭据或环境文件。
- 新增网络服务时明确说明发送哪些数据及可能费用。
- 在合并请求中说明行为变化、验证结果和已知限制。
