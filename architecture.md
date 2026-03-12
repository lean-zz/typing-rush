# Typing Rush MVP Architecture

## 架构目标
- 保持首版实现简单，可快速落地。
- 将游戏逻辑、渲染、内容、存储和 UI 解耦。
- 让 React 负责界面编排，让 Canvas 负责高频文本绘制。
- 保证后续可以平滑扩展语言、题库、统计项和桌面能力。

## 技术栈
- 前端：`Vite + React + TypeScript`
- 桌面壳：`Tauri`
- 持久化：`localStorage`
- 主练习区渲染：`Canvas 2D`

## 顶层模块

### `ui`
职责：
- 菜单页、倒计时页、结果页、设置面板
- 顶部状态栏、HUD、底部提示区
- 绑定用户交互和全局状态

输入：
- `AppState`
- `RunViewModel`
- 历史结果和设置

输出：
- `StartRun`
- `PauseRun`
- `ResumeRun`
- `FinishRun`
- `UpdateSettings`

### `engine`
职责：
- 应用状态机
- 单局计时
- 输入判定
- 连击、准确率、速度和得分计算
- 失焦暂停和恢复

子模块建议：
- `state-machine`
- `timer`
- `input-judge`
- `stats`
- `score`
- `focus-controller`

### `content`
职责：
- 维护题库
- 根据语言和难度筛选 snippet
- 构建连续出题队列
- 控制短时间重复率

子模块建议：
- `snippet-bank`
- `snippet-filter`
- `snippet-queue`

### `render`
职责：
- Canvas 文本布局
- 高亮正确/错误/当前字符
- 控制光标与滚动
- 生成练习区渲染帧

子模块建议：
- `layout`
- `theme`
- `draw-snippet`
- `draw-caret`

### `storage`
职责：
- 读写 `settings`
- 读写 `results`
- 聚合最佳成绩和最近记录

子模块建议：
- `settings-store`
- `results-store`
- `record-aggregator`

## 推荐目录结构

```text
src/
  app/
    App.tsx
    app-state.ts
  types/
    game.ts
    snippet.ts
    storage.ts
  engine/
    state-machine.ts
    timer.ts
    input-judge.ts
    stats.ts
    score.ts
    focus-controller.ts
  content/
    snippets/
      javascript.ts
      typescript.ts
      python.ts
    snippet-filter.ts
    snippet-queue.ts
  render/
    canvas-renderer.ts
    layout.ts
    drawing.ts
    theme.ts
  storage/
    settings-store.ts
    results-store.ts
    record-aggregator.ts
  ui/
    screens/
      MenuScreen.tsx
      CountdownScreen.tsx
      GameScreen.tsx
      ResultScreen.tsx
    components/
      TopBar.tsx
      HudPanel.tsx
      BottomHint.tsx
      PauseOverlay.tsx
      HistoryPanel.tsx
```

## 核心数据模型

```ts
type Language = 'javascript' | 'typescript' | 'python';
type Difficulty = 'easy' | 'medium' | 'hard';
type RunDuration = 300000 | 600000;

type Snippet = {
  id: string;
  language: Language;
  difficulty: Difficulty;
  title: string;
  content: string;
  tags: string[];
};

type RunConfig = {
  durationMs: RunDuration;
  language: Language;
  difficulty: Difficulty;
  soundEnabled: boolean;
};

type RunStats = {
  totalTypedChars: number;
  correctChars: number;
  wrongChars: number;
  backspaceCount: number;
  rawWpm: number;
  wpm: number;
  accuracy: number;
  score: number;
  combo: number;
  maxCombo: number;
  completedSnippets: number;
  lastInputAt: number | null;
};

type ResultRecord = {
  id: string;
  finishedAt: string;
  config: RunConfig;
  stats: RunStats;
};
```

## 状态模型

### App State
```ts
type AppScreen = 'menu' | 'countdown' | 'playing' | 'paused' | 'result';
```

### Run Session State
```ts
type RunSession = {
  config: RunConfig;
  stats: RunStats;
  currentSnippet: Snippet | null;
  currentIndex: number;
  queueOfNextSnippets: Snippet[];
  timeRemainingMs: number;
  isFocused: boolean;
  startedAt: number | null;
};
```

## 关键数据流

### 开局
1. `ui/menu` 收集 `RunConfig`
2. `engine/state-machine` 创建新局
3. `content/snippet-queue` 生成初始题目队列
4. `ui/countdown` 执行 3 秒倒计时
5. 状态切换到 `playing`

### 输入
1. 键盘事件进入 `engine/input-judge`
2. 判定当前字符是否正确
3. `engine/stats` 更新速度、准确率、连击
4. 若片段完成，`content/snippet-queue` 提供下一题
5. `render/canvas-renderer` 刷新视图
6. `ui/HUD` 刷新指标

### 暂停
1. 窗口失焦触发 `focus-controller`
2. `engine/state-machine` 将状态切到 `paused`
3. 计时器冻结
4. UI 显示暂停层
5. 点击后恢复焦点并继续计时

### 结算
1. `timer` 到零后发出结束事件
2. `engine/score` 固化最终统计
3. `storage/results-store` 写入结果
4. `record-aggregator` 计算最佳成绩和最近记录
5. `ui/result` 展示结果页

## 关键设计决策

### React + Canvas 分层
- React 适合管理页面和状态。
- 高频字符高亮和光标绘制更适合 Canvas。
- 这样可以避免 DOM 字符级拆分在长局中带来的性能噪音。

### `localStorage` 优先
- MVP 不需要数据库。
- 本地设置和最近成绩数据量小。
- 更快达成首版验收。

### 纯前端游戏逻辑
- Tauri 首版只做外壳与打包。
- 游戏逻辑留在 TypeScript，开发和测试成本更低。

## 性能约束
- 每次输入只做局部状态更新，避免整棵树重渲染。
- Canvas 渲染应基于当前片段，而不是全量历史文本。
- 历史结果读取和聚合放在开局前或结果页阶段。
- 10 分钟模式下需要控制：
  - 长时间计时漂移
  - 高频输入导致的过度重绘
  - 连续换题时的内存增长

## 主要风险
- `Tab`、`Enter` 和多行内容在判定与渲染上不一致。
- 失焦暂停与重新聚焦可能引发重复计时或漏计时。
- 片段重复控制不足会影响 10 分钟模式体验。
- Canvas 文本布局如果设计过早复杂化，会拖慢开发。

## MVP 之后的扩展位
- 联网排行榜
- 云同步
- 自定义题库导入
- 成就和成长系统
- 更细的训练模式，例如括号专项或缩进专项
