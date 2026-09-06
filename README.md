# SuperDevKit Lite

通用开发技能插件：确认需求、拆票实施、验证代码、验收体验、完成交付。

Lite 从 [SuperDevKit](https://github.com/dermagnet-io/superdevkit) 精简而来，提供一个统一入口和五个核心技能。项目约定负责回答“在这里怎么做”，技能负责明确“怎样才算做好”。同一份技能源打包供 Codex 和 Claude Code 使用。

## 六个技能

| 技能 | 何时使用 | 产出 |
|---|---|---|
| [use](skills/use/SKILL.md) | 使用 Lite 处理任务 | 按需进入适用技能 |
| [grill-to-spec](skills/grill-to-spec/SKILL.md) | 新需求或重要行为仍有待确认 | 明确来源的需求、范围、约束与验收条件 |
| [to-tickets](skills/to-tickets/SKILL.md) | 需求确认后登记和拆分工作 | 可实施的票、依赖关系和逐票实施顺序 |
| [verify](skills/verify/SKILL.md) | 评审代码或验证实现结果 | 需求与规范检查、风险发现和验证证据 |
| [frontend-check](skills/frontend-check/SKILL.md) | 前端流程、交互或呈现受影响 | 实际操作的体验验收结果 |
| [finalize](skills/finalize/SKILL.md) | 实现与适用验证完成后 | 项目约定的交付物及准确状态 |

已确认的要求不重复询问；重要产品决策在相关实现前确认。小需求可以只有一张票。验证范围匹配风险，复用仍有效的证据，用户体验通过实际操作验收。

## 安装

在目标 harness 的插件市场管理入口添加本仓库：

[dermagnet-io/superdevkit-lite](https://github.com/dermagnet-io/superdevkit-lite)

然后安装 `superdevkit-lite`。仓库提供 `.agents/plugins/marketplace.json` 与 `.claude-plugin/marketplace.json`，分别指向预构建的 Codex 与 Claude Code 插件。使用者无需先运行构建脚本；安装或更新后，在新会话中确认六个技能已出现。

技能可通过 harness 的原生调用方式使用；Claude Code 的命名空间示例为 `/superdevkit-lite:grill-to-spec`。Codex 可直接请求使用 `superdevkit-lite` 的 `grill-to-spec` 技能，具体调用入口以当前安装后的技能列表为准。

## 接入项目

可以先调用 `use` 进入 Lite；入口只按需选用技能，不规定项目工具与路径。

消费项目在自己的 AGENTS.md 或对应 harness 的治理入口里配置路由和项目事实。没有固定的绑定键表，不需要初始化脚手架。以下是可按项目调整的路由示例：

```markdown
## 开发路由
- 新需求存在重要歧义时使用 superdevkit-lite 的 grill-to-spec；已确认需求直接沿用。
- 需求确认后使用 to-tickets 登记工作，按依赖顺序逐票实施。
- 代码实现后使用 verify；前端体验受影响时追加 frontend-check。
- 按本项目的交付约定使用 finalize 完成收尾。

## 项目约定
指向实际的需求记录、工作登记位置、架构与修改范围约束。
列出验证命令及其适用范围，体验验收环境与设计规范。
说明交付终点、外部操作授权边界及责任归属。
```

只引用当前任务需要的项目文档，不把完整项目资料或技能正文复制进治理入口。本仓库的 [AGENTS.md](AGENTS.md) **只用于开发 Lite 插件本身**，不会打包进消费项目。

## 从完整版迁移

Lite 是独立插件，名称为 `superdevkit-lite`，版本从 `1.0.0` 开始。采用 Lite 时，将消费项目的路由改为以上六个技能，避免同时路由到两个包的同名技能。

Lite 不包含旧版的 `dev`、`plan`、`execute`、`tdd`、`debugging`、`enter-worktree`、`init`、`setup`、`board`、`dispatch`、`handoff`，也不包含绑定接口、角色模板、停止钩子、看板服务或安装包装 CLI。旧项目若引用这些入口，需要先调整自身约定；Lite 不会自动改写项目文件或卸载完整版。

## 开发本插件

需要 Node.js 18 或更新版本；没有第三方运行依赖。

```sh
npm run build
npm test
```

- `skills/`：唯一可编辑技能源及 Codex UI 元数据。
- `packaging/build.mjs`：生成两个 harness 的最小安装产物。
- `.build/<version>/`：随源码提交的发布物，只通过构建更新。
- `tests/`：打包、路径安全、清单与资源一致性检查。

发布时同步 package.json、两份插件清单和两份市场路径中的版本，重建后提交源码与产物。自动化检查证明包装一致性，不能替代在各 harness 新会话中的实际加载与技能行为验收。

MIT License，保留上游版权声明。
