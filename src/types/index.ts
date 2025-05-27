// 文件数据类型
export interface FileData {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  url?: string
}

// 语音配置类型
export interface VoiceConfig {
  voiceId: string
  speed: number
  volume: number
}

// 音频数据类型
export interface AudioData {
  id: string
  url: string
  duration: number
  size: number
  format: string
  createdAt: string
  text: string
  voiceConfig: VoiceConfig
}

// DUI 语音类型
export interface DUIVoice {
  id: string
  name: string
  description: string
  gender: 'male' | 'female'
  language: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 文件上传响应
export interface UploadResponse {
  fileData: FileData
  text: string
}

// TTS 请求类型
export interface TTSRequest {
  text: string
  voiceConfig: VoiceConfig
}

// TTS 响应类型
export interface TTSResponse {
  audioData: AudioData
}

// 进度状态类型
export interface ProgressStatus {
  stage: 'uploading' | 'parsing' | 'generating' | 'completed' | 'error'
  progress: number
  message: string
}

// 错误类型
export interface AppError {
  code: string
  message: string
  details?: any
}

// 组件 Props 类型
export interface FileUploadProps {
  onFileUpload: (file: File) => void
  fileData?: FileData | null
  maxSize?: number
  acceptedTypes?: string[]
}

export interface TextEditorProps {
  text: string
  onChange: (text: string) => void
  onNext?: () => void
  maxLength?: number
}

export interface VoiceSettingsProps {
  config: VoiceConfig
  onChange: (config: VoiceConfig) => void
  onGenerate: () => void
  isGenerating: boolean
  disabled?: boolean
}

export interface AudioPlayerProps {
  audioData: AudioData
  onDownload?: () => void
}

export interface ProgressBarProps {
  progress: number
  status: ProgressStatus
  className?: string
}

// 常量类型
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'text/plain': '.txt',
  'text/markdown': '.md'
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_TEXT_LENGTH = 50000 // 50k characters

// DUI 默认语音列表
export const DEFAULT_VOICES: DUIVoice[] = [
  {
    id: '1',
    name: '小燕',
    description: '温柔甜美的女声',
    gender: 'female',
    language: 'zh-CN'
  },
  {
    id: '2',
    name: '小宇',
    description: '清晰自然的男声',
    gender: 'male',
    language: 'zh-CN'
  },
  {
    id: '3',
    name: '凯瑟琳',
    description: '优雅的女声',
    gender: 'female',
    language: 'zh-CN'
  },
  {
    id: '4',
    name: '度逍遥',
    description: '磁性的男声',
    gender: 'male',
    language: 'zh-CN'
  },
  {
    id: '5',
    name: '度丫丫',
    description: '活泼的女声',
    gender: 'female',
    language: 'zh-CN'
  }
]

// 语音配置默认值
export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  voiceId: '1', // 小燕
  speed: 5,
  volume: 5
}