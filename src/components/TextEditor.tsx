'use client'

import { useState, useEffect } from 'react'
import { TextEditorProps, MAX_TEXT_LENGTH } from '@/types'

const TextEditor: React.FC<TextEditorProps> = ({ 
  text, 
  onChange, 
  onNext,
  maxLength = MAX_TEXT_LENGTH 
}) => {
  const [localText, setLocalText] = useState(text)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setLocalText(text)
  }, [text])

  useEffect(() => {
    const words = localText.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
    setCharCount(localText.length)
  }, [localText])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    if (newText.length <= maxLength) {
      setLocalText(newText)
      onChange(newText)
      setIsEditing(true)
    }
  }

  const handleClear = () => {
    setLocalText('')
    onChange('')
    setIsEditing(true)
  }

  const handleReset = () => {
    setLocalText(text)
    onChange(text)
    setIsEditing(false)
  }

  const handleNext = () => {
    if (onNext && localText.trim()) {
      onNext()
    }
  }

  const getCharCountColor = () => {
    const percentage = (charCount / maxLength) * 100
    if (percentage >= 90) return 'text-red-500'
    if (percentage >= 75) return 'text-yellow-500'
    return 'text-gray-500'
  }

  const formatText = () => {
    // 基本文本格式化：移除多余空行，统一段落间距
    const formatted = localText
      .split('\n')
      .map(line => line.trim())
      .filter((line, index, arr) => {
        // 保留非空行，以及非连续的空行
        return line !== '' || (index > 0 && arr[index - 1] !== '')
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // 最多保留两个连续换行
    
    setLocalText(formatted)
    onChange(formatted)
    setIsEditing(true)
  }

  const insertTemplate = (template: string) => {
    const newText = localText + (localText ? '\n\n' : '') + template
    if (newText.length <= maxLength) {
      setLocalText(newText)
      onChange(newText)
      setIsEditing(true)
    }
  }

  const templates = [
    {
      name: '欢迎语',
      content: '欢迎使用我们的文字转语音服务。我们致力于为您提供高质量的语音合成体验。'
    },
    {
      name: '产品介绍',
      content: '这是一个功能强大的产品，具有创新的设计和卓越的性能，能够满足您的各种需求。'
    },
    {
      name: '感谢语',
      content: '感谢您的使用和支持。如果您有任何问题或建议，请随时联系我们。'
    }
  ]

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={formatText}
            className="btn-secondary text-sm"
            disabled={!localText.trim()}
          >
            格式化文本
          </button>
          <button
            onClick={handleClear}
            className="btn-secondary text-sm text-red-600 hover:bg-red-50"
            disabled={!localText.trim()}
          >
            清空
          </button>
          {isEditing && (
            <button
              onClick={handleReset}
              className="btn-secondary text-sm"
            >
              重置
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>字数: {wordCount}</span>
          <span className={getCharCountColor()}>
            字符: {charCount}/{maxLength}
          </span>
        </div>
      </div>

      {/* 文本编辑区域 */}
      <div className="relative">
        <textarea
          value={localText}
          onChange={handleTextChange}
          placeholder="请输入要转换为语音的文字内容，或上传文档自动提取文字..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
          maxLength={maxLength}
        />
        
        {/* 字符计数指示器 */}
        <div className="absolute bottom-3 right-3">
          <div className={`text-xs px-2 py-1 rounded ${getCharCountColor()} bg-white border`}>
            {charCount}/{maxLength}
          </div>
        </div>
      </div>

      {/* 快速模板 */}
      {!localText.trim() && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">快速模板：</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => insertTemplate(template.content)}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {template.name}
                </div>
                <div className="text-xs text-gray-500 line-clamp-2">
                  {template.content}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 文本预览和统计 */}
      {localText.trim() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">文本统计</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">总字数</span>
              <p className="text-blue-900">{wordCount} 词</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">字符数</span>
              <p className="text-blue-900">{charCount} 字符</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">段落数</span>
              <p className="text-blue-900">{localText.split('\n\n').filter(p => p.trim()).length} 段</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">预计时长</span>
              <p className="text-blue-900">{Math.ceil(wordCount / 150)} 分钟</p>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {onNext && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!localText.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步：配置语音
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>提示：</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>建议文本长度在 1000-5000 字符之间，以获得最佳语音效果</li>
          <li>避免使用特殊符号和格式，纯文本效果最佳</li>
          <li>可以使用标点符号来控制语音的停顿和语调</li>
          <li>支持中英文混合，但建议以一种语言为主</li>
        </ul>
      </div>
    </div>
  )
}

export default TextEditor