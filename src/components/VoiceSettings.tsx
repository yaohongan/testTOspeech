'use client'

import { useState, useEffect } from 'react'
import { VoiceSettingsProps, DEFAULT_VOICES, DUIVoice } from '@/types'

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ 
  config, 
  onChange, 
  onGenerate, 
  isGenerating, 
  disabled = false 
}) => {
  const [voices, setVoices] = useState<DUIVoice[]>(DEFAULT_VOICES)
  const [isLoadingVoices, setIsLoadingVoices] = useState(false)
  const [previewPlaying, setPreviewPlaying] = useState<string | null>(null)

  useEffect(() => {
    loadVoices()
  }, [])

  const loadVoices = async () => {
    setIsLoadingVoices(true)
    try {
      const response = await fetch('/api/voices')
      if (response.ok) {
        const data = await response.json()
        setVoices(data.voices || DEFAULT_VOICES)
      }
    } catch (error) {
      console.error('加载语音列表失败:', error)
      // 使用默认语音列表
    } finally {
      setIsLoadingVoices(false)
    }
  }

  const handleVoiceChange = (voiceId: string) => {
    onChange({ ...config, voiceId })
  }

  const handleParameterChange = (key: keyof typeof config, value: number) => {
    onChange({ ...config, [key]: value })
  }

  const playPreview = async (voiceId: string) => {
    if (previewPlaying === voiceId) {
      setPreviewPlaying(null)
      return
    }

    setPreviewPlaying(voiceId)
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voiceId,
          text: '这是一个语音预览示例。Hello, this is a voice preview sample.'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          setPreviewPlaying(null)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.onerror = () => {
          setPreviewPlaying(null)
          URL.revokeObjectURL(audioUrl)
        }
        
        await audio.play()
      } else {
        setPreviewPlaying(null)
      }
    } catch (error) {
      console.error('预览播放失败:', error)
      setPreviewPlaying(null)
    }
  }

  const getVoiceById = (voiceId: string) => {
    return voices.find(voice => voice.id === voiceId) || voices[0]
  }

  const selectedVoice = getVoiceById(config.voiceId)

  return (
    <div className="space-y-6">
      {/* 语音选择 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">选择语音</h3>
        
        {isLoadingVoices ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">加载语音列表...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  config.voiceId === voice.id
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
                onClick={() => handleVoiceChange(voice.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        config.voiceId === voice.id ? 'bg-primary-600' : 'bg-gray-300'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{voice.name}</h4>
                        {voice.description && (
                          <p className="text-sm text-gray-500">{voice.description}</p>
                        )}
                        <span className="text-xs text-gray-400">{voice.gender === 'male' ? '男声' : '女声'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      playPreview(voice.id)
                    }}
                    disabled={disabled}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors disabled:opacity-50"
                    title="预览语音"
                  >
                    {previewPlaying === voice.id ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 基础参数 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">基础设置</h3>
        
        <div className="space-y-4">
          {/* 语速 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              语速: {config.speed}
            </label>
            <input
              type="range"
              min="0"
              max="9"
              step="1"
              value={config.speed}
              onChange={(e) => handleParameterChange('speed', parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>最慢 (0)</span>
              <span>正常 (5)</span>
              <span>最快 (9)</span>
            </div>
          </div>

          {/* 音量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              音量: {config.volume}
            </label>
            <input
              type="range"
              min="0"
              max="9"
              step="1"
              value={config.volume}
              onChange={(e) => handleParameterChange('volume', parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>最小 (0)</span>
              <span>正常 (5)</span>
              <span>最大 (9)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 当前配置预览 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">当前配置</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-600 font-medium">语音:</span>
            <p className="text-blue-900">{selectedVoice?.name}</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">语速:</span>
            <p className="text-blue-900">{config.speed}</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">音量:</span>
            <p className="text-blue-900">{config.volume}</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">性别:</span>
            <p className="text-blue-900">{selectedVoice?.gender === 'male' ? '男声' : '女声'}</p>
          </div>
        </div>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            生成中...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6v-6a3 3 0 000-6zm0 0V7a2 2 0 012-2h4a2 2 0 012 2v2M9 9a3 3 0 000 6v-6a3 3 0 000-6z" />
            </svg>
            生成语音
          </>
        )}
      </button>

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>提示：</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>不同语音适合不同类型的内容，建议先试听预览</li>
          <li>语速范围0-9，5为正常语速</li>
          <li>音量范围0-9，5为正常音量</li>
          <li>单次文本限制200字符，超出会自动分段处理</li>
          <li>生成时间取决于文本长度，请耐心等待</li>
        </ul>
      </div>
    </div>
  )
}

export default VoiceSettings