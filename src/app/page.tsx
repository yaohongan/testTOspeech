'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import TextEditor from '@/components/TextEditor'
import VoiceSettings from '@/components/VoiceSettings'
import AudioPlayer from '@/components/AudioPlayer'
import { FileData, VoiceConfig, AudioData } from '@/types'

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    voiceId: 'default',
    speed: 5,
    volume: 5
  })
  const [audioData, setAudioData] = useState<AudioData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleFileUpload = async (file: File) => {
    try {
      // 动态导入PDF处理函数
      const isPDFFile = (file: File): boolean => {
        return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      }

      // 如果是PDF文件，直接在客户端处理
      if (isPDFFile(file)) {
        const { extractTextFromPDF } = await import('@/utils/pdfProcessor')
        const extractedText = await extractTextFromPDF(file)
        const fileData: FileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
        setFileData(fileData)
        setExtractedText(extractedText)
        setCurrentStep(2)
        return
      }

      // 其他文件类型通过服务器处理
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('文件上传失败')
      }
      
      const result = await response.json()
      
      // 检查是否需要客户端处理PDF
      if (result.text === '__PDF_CLIENT_PROCESSING__') {
        const { extractTextFromPDF } = await import('@/utils/pdfProcessor')
        const extractedText = await extractTextFromPDF(file)
        setFileData(result.fileData)
        setExtractedText(extractedText)
      } else {
        setFileData(result.fileData)
        setExtractedText(result.text)
      }
      
      setCurrentStep(2)
    } catch (error) {
      console.error('文件上传错误:', error)
      alert('文件上传失败，请重试')
    }
  }

  const handleTextChange = (text: string) => {
    setExtractedText(text)
  }

  const handleVoiceConfigChange = (config: VoiceConfig) => {
    setVoiceConfig(config)
  }

  const handleGenerateAudio = async () => {
    if (!extractedText.trim()) {
      alert('请输入要转换的文字')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: extractedText,
          voiceConfig
        })
      })

      if (!response.ok) {
        throw new Error('语音生成失败')
      }

      const result = await response.json()
      setAudioData(result)
      setCurrentStep(4)
    } catch (error) {
      console.error('语音生成错误:', error)
      alert('语音生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const steps = [
    { id: 1, name: '上传文件', description: '选择并上传文档文件' },
    { id: 2, name: '编辑文字', description: '查看和编辑提取的文字' },
    { id: 3, name: '语音设置', description: '配置语音参数' },
    { id: 4, name: '生成音频', description: '播放和下载音频' }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gradient mb-6">
          智能文字转语音平台
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          上传文档，智能提取文字，生成自然流畅的中文语音。支持PDF、Word、TXT等格式，使用DUI免费语音合成技术，让文字变声音。
        </p>
      </div>

      {/* 步骤指示器 */}
      <div className="mb-12">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                currentStep >= step.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg'
                  : 'border-gray-300 text-gray-500 hover:border-blue-400'
              }`}>
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3 text-left">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                  currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：文件上传和文字编辑 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 步骤1：文件上传 */}
          {currentStep >= 1 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3 shadow-md">1</span>
                文件上传
              </h2>
              <FileUpload onFileUpload={handleFileUpload} fileData={fileData} />
            </div>
          )}

          {/* 步骤2：文字编辑 */}
          {currentStep >= 2 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3 shadow-md">2</span>
                文字编辑
              </h2>
              <TextEditor 
                text={extractedText} 
                onChange={handleTextChange}
                onNext={() => setCurrentStep(3)}
              />
            </div>
          )}
        </div>

        {/* 右侧：语音设置和音频播放 */}
        <div className="space-y-6">
          {/* 步骤3：语音设置 */}
          {currentStep >= 3 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3 shadow-md">3</span>
                语音设置
              </h2>
              <VoiceSettings 
                config={voiceConfig}
                onChange={handleVoiceConfigChange}
                onGenerate={handleGenerateAudio}
                isGenerating={isGenerating}
                disabled={!extractedText.trim()}
              />
            </div>
          )}

          {/* 步骤4：音频播放 */}
          {currentStep >= 4 && audioData && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3 shadow-md">4</span>
                音频播放
              </h2>
              <AudioPlayer audioData={audioData} />
            </div>
          )}
        </div>
      </div>

      {/* 功能特点 */}
      {currentStep === 1 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">功能特点</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">多格式支持</h3>
              <p className="text-gray-600">支持PDF、Word、TXT等常见文档格式，自动提取文字内容</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">免费语音合成</h3>
              <p className="text-gray-600">使用DUI免费技术，提供自然流畅的中文语音合成效果</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">便捷下载</h3>
              <p className="text-gray-600">生成的音频文件可直接播放和下载，支持多种音频格式</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}