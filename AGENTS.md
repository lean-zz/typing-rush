# AGENTS.md

## Project
Typing Rush 是一个面向程序员的桌面打字竞速游戏 MVP。目标是做出一个本地单机、可持续练习代码输入的桌面应用，而不是社交或竞技平台。

唯一正式需求来源是 [`spec.md`](D:\WorkPlace\Codex\typing-rush\spec.md)。实现、拆解和取舍都必须以该文件为准。

## Product Intent
- 训练代码输入能力，而不是通用英文打字。
- 重点覆盖括号、引号、大小写、缩进、操作符、关键字。
- 首版只做单机、本地存档、Windows 桌面运行。
- 首版不做联网排行榜、账号系统、多人、云同步、自定义题库、中文输入法模式。

## Tech Direction
- 前端：`Vite + React + TypeScript`
- 桌面壳：`Tauri`
- 持久化：`localStorage`
- 主练习区渲染：`Canvas 2D`

Tauri 在 MVP 中只作为桌面壳，不要把核心游戏逻辑写进 Rust，除非后续需求明确要求。

## Architecture Constraints
实现时按以下模块边界组织：

- `engine`
  - 状态机
  - 计时
  - 输入判定
  - 计分和统计
- `content`
  - 题库
  - 语言/难度筛选
  - 随机队列与去重
- `storage`
  - `settings`
  - `results`
  - 最佳成绩和最近记录聚合
- `render`
  - Canvas 文本布局
  - 光标
  - 正确/错误字符高亮
- `ui`
  - 菜单
  - 倒计时
  - 游戏 HUD
  - 暂停提示
  - 结果页

React 负责页面与状态绑定，Canvas 负责主练习区字符渲染。不要把字符级高亮渲染回退成大段 DOM 文本方案，除非有明确理由。

## Core Gameplay Requirements
- 应用状态固定为：
  - `menu`
  - `countdown`
  - `playing`
  - `paused`
  - `result`
- 模式只支持：
  - `5 分钟`
  - `10 分钟`
- 语言只支持：
  - `JavaScript`
  - `TypeScript`
  - `Python`
- 难度至少支持：
  - `Easy`
  - `Medium`
  - `Hard`
- 每局开始前要有 `3 秒倒计时`
- 输入按字符判定
- 默认允许 `Backspace` 修正，但错误次数仍计入统计
- 片段完成后无缝切换下一题，整局计时不中断
- 失焦时自动暂停，恢复后继续

## Data Model Expectations
实现时至少覆盖这些数据结构：

```ts
type Snippet = {
  id: string;
  language: 'javascript' | 'typescript' | 'python';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  content: string;
  tags: string[];
};

type ResultRecord = {
  id: string;
  finishedAt: string;
  config: RunConfig;
  stats: RunStats;
};
```

局内状态至少要有：
- `RunConfig`
- `RunStats`
- `currentSnippet`
- `currentIndex`
- `timeRemainingMs`
- `isFocused`
- `queueOfNextSnippets`

## Metrics Requirements
HUD 和结果页至少展示：
- `Raw WPM`
- `WPM`
- `Accuracy`
- `Score`
- `Max Combo`
- `Completed Snippets`

计分遵循这些原则：
- 速度是基础
- 高准确率有明显收益
- 稳定持续输入应有奖励
- 高频错误和长停顿应有惩罚

不要在 MVP 引入复杂街机倍率系统。

## Content Requirements
- 题目是短代码片段，不是长文。
- 单个 snippet 建议 `1 到 8 行`。
- 题库需要带元数据和标签。
- 每个语言每个难度至少准备 `20` 段，目标总量约 `180` 段。
- 出题必须按当前语言和难度过滤。
- 需要尽量避免短时间重复同一 snippet。

如果题库建设尚未完成，先保证结构和最小样本可跑通，再扩充内容。

## UX Requirements
- 焦点必须稳定，点击开始后游戏区自动获取焦点。
- 若失焦，必须明确提示“已暂停，点击继续”或同等级别提示。
- `Tab` 如出现在题目中，统一替换为空格处理，避免浏览器默认焦点行为。
- 长局中每分钟给一次轻量反馈，但不要中断输入。
- 视觉风格偏“开发者工作台”，强调耐看和低疲劳。

## Storage Requirements
本地至少持久化两类数据：
- `settings`
- `results`

建议保留：
- 默认模式
- 最近 `20` 条成绩
- 每个模式的最佳成绩
- 各语言最佳成绩

MVP 优先使用 `localStorage`，不要引入数据库。

## Delivery Priorities
按以下顺序推进，除非用户明确重排优先级：
1. 初始化前端和 Tauri 骨架
2. 打通菜单 -> 倒计时 -> 开局 -> 结算最小闭环
3. 实现字符判定与实时统计
4. 接入 Canvas 渲染
5. 接入题库和连续推题
6. 接入本地设置与成绩
7. 补暂停恢复、10 分钟模式和视觉打磨
8. 验证 Windows 打包

## Working Rules For Codex
- 任何实现前先对齐 [`spec.md`](D:\WorkPlace\Codex\typing-rush\spec.md)，不要自行扩 scope。
- 优先做可运行的垂直切片，再补完整内容量。
- 写 JavaScript 或 TypeScript 后必须运行 `npm test`。
- 安装依赖时优先使用 `pnpm`。
- 新增代码优先保持模块纯净和可测试。
- 核心逻辑优先写成纯函数，便于测试状态机、计分和判定。
- 如果需求与 `spec.md` 冲突，先指出冲突再实施。

## Acceptance Bar
MVP 完成时至少满足：
- 可在 Windows 以桌面应用形式运行
- 可选 `5 分钟` / `10 分钟`
- 可选三种语言
- 游戏连续推送代码片段且不会空题或卡死
- 实时显示 `WPM`、`Accuracy`、`Score`、`Combo`
- 时间结束后展示结果页
- 设置和历史成绩重启后保留
- 失焦暂停和恢复可用
- `10 分钟` 模式无明显性能问题

## When Unsure
- 先选更小、更稳、更容易验证的方案。
- 先满足 MVP，再谈扩展性。
- 如果需要在“快速交付”和“复杂设计”之间取舍，优先快速交付。
