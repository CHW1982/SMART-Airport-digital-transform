# 智慧機場數位轉型專案

## 專案簡介

本專案旨在建立智慧機場的數位轉型架構，提供互動式的系統架構視覺化和資料流管理。

## 專案結構

```text
smart_airport_Digital_Transformation/
├── docs/                          # 📚 文件與原型
│   ├── prototypes/               # HTML 原型文件
│   │   ├── v1_initial.html      # 初始版本原型
│   │   └── v2_optimized.html    # 優化版本原型
│   └── README.md                 # 文件說明
│
├── v1/                           # ✨ 當前開發版本
│   ├── src/                      # React + TypeScript 源碼
│   ├── components/               # React 組件
│   ├── services/                 # API 服務層
│   ├── public/                   # 靜態資源
│   └── ...                       # Vite 專案文件
│
├── .gitignore                    # Git 忽略規則
└── README.md                     # 本文件
```

## 技術棧

### V1 版本（React + Vite）

- **前端框架**: React 18 + TypeScript
- **建構工具**: Vite
- **樣式**: TailwindCSS
- **AI 整合**: Google Gemini API

## 快速開始

### 啟動開發服務器

```bash
cd v1
npm install
npm run dev
```

### 建構生產版本

```bash
cd v1
npm run build
```

## 版本演進

### 原型階段

- **v1_initial.html**: 初始 HTML 原型，展示基本架構
- **v2_optimized.html**: 優化版原型，改進互動體驗

### 開發階段

- **v1/**: React 重構版本，整合 Gemini AI 進行智能資料分析

## 開發指南

請參考 `docs/` 資料夾中的相關文件了解更多開發細節。

## 授權

本專案為內部開發專案。
