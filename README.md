# 文字转语音网站项目 (Text-to-Speech Web Application)

## 项目概述

本项目是一个功能完整的文字转语音网站，支持文件上传、文字解析、语音生成和音频下载等核心功能。项目采用现代化的技术栈，支持在Vercel平台部署。

## 需求理解

### 核心功能模块

1. **文件上传与文字解析**
   - 支持PDF、Word、TXT等常见文档格式
   - 自动提取文档中的文字内容
   - 实时显示上传进度和文件预览

2. **文字转语音播放**
   - 集成ElevenLabs API提供高质量语音合成
   - 多种语音角色选择
   - 可调节语速、音调等参数
   - 实时播放生成的语音

3. **音频管理与下载**
   - 保存生成的音频文件到云存储
   - 提供音频播放控制界面
   - 支持音频文件下载功能

### 技术架构

- **前端**: React + Tailwind CSS
- **后端**: Node.js + Express (Serverless Functions)
- **部署平台**: Vercel
- **文件存储**: AWS S3兼容存储/Vercel Storage
- **语音服务**: ElevenLabs API

## 实现方式

### 1. 项目结构设计

```
testTOmp3/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   │   ├── FileUpload/   # 文件上传组件
│   │   │   ├── AudioPlayer/  # 音频播放器组件
│   │   │   ├── VoiceSettings/ # 语音设置组件
│   │   │   └── ProgressBar/  # 进度条组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── Home/        # 主页
│   │   │   ├── Upload/      # 上传页面
│   │   │   └── Library/     # 音频库页面
│   │   ├── services/        # API服务
│   │   │   ├── fileService.js
│   │   │   ├── ttsService.js
│   │   │   └── audioService.js
│   │   └── utils/           # 工具函数
│   │       ├── fileParser.js
│   │       └── audioUtils.js
│   ├── public/              # 静态资源
│   └── package.json
├── api/                     # Vercel Serverless Functions
│   ├── upload.js           # 文件上传API
│   ├── parse.js            # 文字解析API
│   ├── tts.js              # 文字转语音API
│   └── download.js         # 文件下载API
├── lib/                    # 后端业务逻辑
│   ├── fileProcessor.js    # 文件处理逻辑
│   ├── ttsProcessor.js     # 语音合成逻辑
│   └── storageManager.js   # 存储管理
├── models/                 # 数据模型
│   ├── File.js
│   └── Audio.js
├── vercel.json             # Vercel配置文件
├── package.json            # 项目依赖
└── README.md               # 项目文档
```

### 2. 技术实现要点

#### 前端实现
- 使用React Hooks管理组件状态
- Tailwind CSS构建响应式UI界面
- 文件拖拽上传功能
- 实时进度显示和状态反馈
- 音频播放控制组件

#### 后端实现
- Serverless Functions处理API请求
- 文件解析库(pdf-parse, mammoth等)
- ElevenLabs API集成
- 云存储服务集成
- 错误处理和日志记录

#### 部署配置
- Vercel自动化部署
- 环境变量管理
- 域名和SSL配置
- 性能优化设置

### 3. 关键技术选型

- **文件解析**: 
  - PDF: pdf-parse
  - Word: mammoth
  - TXT: 原生读取
- **语音合成**: ElevenLabs API
- **文件存储**: Vercel Blob Storage
- **状态管理**: React Context + useReducer
- **HTTP客户端**: Axios
- **UI组件**: 自定义组件 + Tailwind CSS

## 开发计划

### 第一阶段：项目初始化 (预计1-2天)
- [x] 创建项目README文档
- [ ] 初始化React项目结构
- [ ] 配置Tailwind CSS
- [ ] 设置Vercel部署配置
- [ ] 创建基础组件框架

### 第二阶段：文件上传模块 (预计2-3天)
- [ ] 实现文件上传组件
- [ ] 集成文件解析功能
- [ ] 添加上传进度显示
- [ ] 实现文件预览功能
- [ ] 错误处理和验证

### 第三阶段：语音合成模块 (预计3-4天)
- [ ] 集成ElevenLabs API
- [ ] 实现语音参数设置
- [ ] 添加语音预览功能
- [ ] 实现音频生成和保存
- [ ] 优化API调用性能

### 第四阶段：音频管理模块 (预计2-3天)
- [ ] 实现音频播放器
- [ ] 添加音频列表管理
- [ ] 实现下载功能
- [ ] 添加音频元数据管理

### 第五阶段：部署和优化 (预计1-2天)
- [ ] Vercel平台部署
- [ ] 性能优化
- [ ] 错误监控
- [ ] 用户体验优化

## 环境变量配置

```env
# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# 存储配置
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# 应用配置
NEXT_PUBLIC_APP_URL=your_app_url
```

## 开发注意事项

1. **安全性**
   - API密钥安全存储
   - 文件上传大小限制
   - 输入验证和清理

2. **性能优化**
   - 文件分块上传
   - 音频流式处理
   - 缓存策略

3. **用户体验**
   - 响应式设计
   - 加载状态提示
   - 错误信息友好显示

## 操作记录

### 2024-12-19
- ✅ 创建项目README文档
- ✅ 完成需求分析和技术方案设计
- ✅ 制定详细的开发计划

---

**下一步操作**: 等待进一步指令开始项目开发

**当前状态**: 项目规划完成，等待开发启动