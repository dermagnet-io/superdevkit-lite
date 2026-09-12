# SuperDevKit Lite

通用开发技能插件：整理项目治理、确认需求、拆票实施、验证代码、验收体验、完成交付。

Lite 从 [SuperDevKit](https://github.com/dermagnet-io/superdevkit) 精简而来，提供一个统一入口和七个按需使用的技能。项目约定负责回答“在这里怎么做”，技能负责明确“怎样才算做好”。同一份技能源打包供 Codex 和 Claude Code 使用。

## 八个技能

| 技能 | 何时使用 | 产出 |
|---|---|---|
| [use](skills/use/SKILL.md) | 使用 Lite 处理任务 | 按需进入适用技能 |
| [setup](skills/setup/SKILL.md) | 接入项目或整理系统级治理文档 | 有依据的修改方案，用户批准后修订文档 |
| [start](skills/start/SKILL.md) | 首次实现、切换范围或上下文变化 | 核对任务、分支、工作区及运行环境，决定复用或隔离 |
| [grill-to-spec](skills/grill-to-spec/SKILL.md) | 新需求或重要行为仍有待确认 | 明确来源的需求、范围、约束与验收条件 |
| [to-tickets](skills/to-tickets/SKILL.md) | 需求确认后登记和拆分工作 | 可实施的票、依赖关系和逐票实施顺序 |
| [verify](skills/verify/SKILL.md) | 评审代码或验证实现结果 | 需求与规范检查、风险发现和验证证据 |
| [frontend-check](skills/frontend-check/SKILL.md) | 前端流程、交互或呈现受影响 | 实际操作的体验验收结果 |
| [finalize](skills/finalize/SKILL.md) | 实现与适用验证完成后 | 项目约定的交付物及固定格式回报 |

已确认的要求不重复询问；重要产品决策在相关实现前确认。小需求可以只有一张票。验证范围匹配风险，复用仍有效的证据，用户体验通过实际操作验收。

### 深入访谈

技能内附按需读取的 [Spec 格式模板](skills/grill-to-spec/references/SPEC-FORMAT.md)。单项需求文档保存在 `docs/specs/`，保留消费项目已有的有效内容；旧路径迁移先提出方案，经批准后同步引用。

`grill-to-spec` 按决策依赖分轮追问：每轮回答后展开下游问题，用反例检验规则、体验和方案取舍，记录决定及理由，直到范围内的重要分支得到确认或明确排除。它不会把首轮功能清单当成完整需求，也不会让明确的小修补重新经历长访谈。

访谈方式参考 Matt Pocock 的 [grill-with-docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)、[grilling](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) 和 [domain-modeling](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)。Lite 保留决策追问与及时记录的原则，需求按上述目录落档，具体工具由消费项目决定。

## 安装

在目标 harness 的插件市场管理入口添加本仓库：

[dermagnet-io/superdevkit-lite](https://github.com/dermagnet-io/superdevkit-lite)

然后安装 `superdevkit-lite`。仓库提供 `.agents/plugins/marketplace.json` 与 `.claude-plugin/marketplace.json`，分别指向预构建的 Codex 与 Claude Code 插件。使用者无需先运行构建脚本；安装或更新后，在新会话中确认八个技能已出现。1.1.0 新增 start，1.2.0 新增 setup；仅修改源码或完成构建不代表已发布或当前会话已加载新技能。

技能可通过 harness 的原生调用方式使用；Claude Code 的命名空间示例为 `/superdevkit-lite:grill-to-spec`。Codex 可直接请求使用 `superdevkit-lite` 的 `grill-to-spec` 技能，具体调用入口以当前安装后的技能列表为准。

## 接入项目

可以先调用 `use` 进入 Lite；入口按需选用技能，具体工具、验证命令和交付方式取自项目约定。

### 治理文档体检

调用 `setup` 可检查现有文档与仓库依据，发现缺失、过时、冲突、重复和无法验证的要求。它先给出文件位置、问题依据与具体拟改内容，用户批准后才写入；完全没有系统级文档时，先通过 `grill-to-spec` 确认产品需求。它不是每次开发的必经步骤，也不自动安装工具或实施文档中规划的代码工作。

技能附带按需读取的 [根目录入口模板](skills/setup/references/entrypoints.md) 和七个主题模板，每份说明内容职责、完成标准和不足时的编辑方式。核心文档固定放在 `docs/` 根目录，编号表示人类阅读顺序，agent 仍按任务读取：

```text
docs/
  01-product-requirement.md
  02-architecture.md
  03-decision-log.md
  04-roadmap.md
  05-ux-ux.md
  06-developing.md
  07-testing.md
  specs/                    单项需求及规格说明
```

部署、安全、数据等系统级扩展文档按需放在 `docs/` 根目录，从 08 起编号并由 AGENTS 路由。现有路径或编号冲突先提出迁移映射、内容去向和引用更新方案，经批准后处理，不覆盖旧文档。

文档体检以整理格式、结构和补充内容为主，保留项目事实与当前开发相关的需求、约束、计划、问题和证据。疑似重复或过时内容先保留并标明疑点；一般整理授权不包含删减。迁移、合并或归档须核对内容无遗漏，当前开发信息不因精简而删除。

AGENTS 维护共享约束和阅读条件，其他 harness 入口按已核实的加载机制引用共享内容或维护必要镜像。文档链接存在不等于宿主已加载。新增决策通常 2–4 行，记录日期、决定、关键理由和状态；已有长记录先加摘要，详细依据保留，归档须批准并保留全文、编号与引用。

设计参考 [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md) 的按需引用与单一维护源、[architecture-blueprint-generator](https://github.com/github/awesome-copilot/blob/main/skills/architecture-blueprint-generator/SKILL.md) 的架构分析维度，以及 [OpenAI 的技能与提示词建议](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)。文档分工结合 [DesignHub](https://github.com/dermagnet-io/designhub/blob/main/AGENTS.md) 与 [Paralex](https://github.com/dermagnet-io/paralex/blob/main/AGENTS.md) 的实践，模板不绑定它们的技术栈、业务规则或交付政策。

### 项目路由

消费项目在自己的 AGENTS.md 或对应 harness 的治理入口里配置路由和项目事实。没有固定的绑定键表，不需要初始化脚手架。以下是可按项目调整的路由示例：

```markdown
## 开发路由
- 普通讨论、解释和方案比较直接回答，默认不进入 Lite 开发流程；明确要求执行修改时调用 use。用户点名技能时按其要求。
- 开发中途提问不自动取消已有任务；用户明确暂停或转为讨论时停止后续实施。
- 项目接入或治理整理时使用 superdevkit-lite 的 setup，先审阅方案再批准文档修改。
- 实现前使用 superdevkit-lite 的 start；同一任务继续时只复核变化的上下文。
- 新需求存在重要歧义时使用 superdevkit-lite 的 grill-to-spec；已确认需求直接沿用。
- 需求确认后使用 to-tickets 登记工作，按依赖顺序逐票实施。
- 代码实现后使用 verify；前端体验受影响时追加 frontend-check。
- 按本项目的交付约定使用 finalize 完成收尾。

## 项目约定
核心文档放 docs/ 根目录并按 01–07 编号；单项需求放 docs/specs/，扩展主题从 08 起编号。编号只用于人类阅读顺序。
指向实际的工作登记位置、架构与修改范围约束，维护时保留项目内容与当前开发信息。
说明默认基线、分支命名、工作区隔离与复用规则；没有要求的项目不强加外部 tracker。
列出验证命令及其适用范围，体验验收环境与设计规范。
说明交付终点、票据关闭条件、外部操作授权边界、环境保留与清理约束。
```

只引用当前任务需要的项目文档，不把完整项目资料或技能正文复制进治理入口。本仓库的 [AGENTS.md](AGENTS.md) **只用于开发 Lite 插件本身**，不会打包进消费项目。

### 开发回报

各 harness 共用 [finalize 的回报格式](skills/finalize/SKILL.md#最终回报)，依次为：完成情况、完成内容、验证结果、如何验收（按需）、交付位置、下一步。完成情况用一个状态加一句话补充；完成内容、如何验收和交付位置按点写，不限制长度；下一步尽量简洁，需要用户决定的事项按点列出。重要失败和限制直接说明。讨论会话和中途问答不套用交付报告。

Lite 提供执行约定，不附带自动分支检查、CI 或停止门禁；宿主能力以实际可用工具为准。项目可另接可执行检查，但不能把技能被引用或声明字段存在当作已经执行。默认不要求多代理或固定角色。

## 从完整版迁移

Lite 是独立插件，名称为 `superdevkit-lite`，版本从 `1.0.0` 开始。采用 Lite 时，将消费项目的路由按需改为以上技能，避免同时路由到两个包的同名技能。尚未升级时明确缺少的技能；不要把未安装的 start 或 setup 声称为已启用。

Lite 不包含旧版的 `dev`、`plan`、`execute`、`tdd`、`debugging`、`enter-worktree`、`init`、`board`、`dispatch`、`handoff`，也不包含绑定接口、角色模板、停止钩子、看板服务或安装包装 CLI。1.2.0 的 `setup` 是治理文档体检，不承接旧版 setup 的绑定或初始化行为。旧项目若引用这些入口，需要先调整自身约定；Lite 不会自动改写项目文件或卸载完整版。

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
