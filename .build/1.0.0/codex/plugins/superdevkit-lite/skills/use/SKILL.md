---
name: use
description: SuperDevKit Lite 的入口，结合项目约定选择需求、拆票、验证、体验验收或交付技能。
---

# SuperDevKit Lite

读取当前任务及项目治理入口中适用的路由、约束和交付约定。只加载当前阶段需要的技能，不预先读取全部技能或项目文档。

| 当前工作 | 技能 |
|---|---|
| 澄清重要需求、范围或验收条件 | [grill-to-spec](../grill-to-spec/SKILL.md) |
| 已确认需求，需要登记与拆分工作 | [to-tickets](../to-tickets/SKILL.md) |
| 代码评审或实现验证 | [verify](../verify/SKILL.md) |
| 前端流程、交互或呈现受影响 | [frontend-check](../frontend-check/SKILL.md) |
| 验证后完成约定交付 | [finalize](../finalize/SKILL.md) |

已明确的需求和已有工作票直接沿用。开发任务按项目约定从当前阶段继续，直到达到交付终点；只读查询、仅评审或仅拆票请求保持原范围，不自动扩展为实现或发布。

具体文档、工作登记位置、验证命令和交付路径取自项目约定。缺少必要信息时先完成可独立推进的部分，只询问影响下一步的缺口，不创造固定绑定或初始化要求。
