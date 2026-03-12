# Typing Rush

Typing Rush 是面向程序员的桌面打字竞速 MVP，基于 `Vite + React + TypeScript + Tauri`。

## Development

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Build Web

```bash
npm run build
```

## Tauri Desktop

先安装 Rust 工具链与 Tauri 依赖，然后执行：

```bash
npm run tauri dev
npm run tauri build
```

## MVP Scope Implemented

- menu -> countdown -> playing -> paused -> result 状态流转
- 5/10 分钟模式、JS/TS/Python、Easy/Medium/Hard
- 字符判定、Backspace 修正、实时 Raw WPM/WPM/Accuracy/Score/Combo
- Canvas 2D 主练习区渲染（字符高亮、光标）
- 连续推题与短期去重
- 本地 `settings` / `results` 持久化，保留最近 20 条
- 失焦自动暂停与点击恢复
