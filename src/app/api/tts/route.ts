import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// DUI平台免费TTS API配置
const DUI_TTS_BASE_URL = 'https://dds.dui.ai/runtime/v1/synthesize'

// 支持的语音类型
const VOICE_OPTIONS = {
  'xiaoling': { id: 'zhilingf', name: '小玲', description: '甜美性感' },
  'xiaojing': { id: 'xjingf', name: '小静', description: '甜美女声' },
  'xiaomei': { id: 'juan1f', name: '小美', description: '客服女声' },
  'tingting': { id: 'xmguof', name: '婷婷', description: '营销女声' },
  'xiaomi': { id: 'xmamif', name: '小咪', description: '营销女声' },
  'qiumo': { id: 'qiumum', name: '秋木', description: '活泼开朗' },
  'kaola': { id: 'kaolam', name: '考拉', description: '标准男声' },
  'xiaojun': { id: 'xijunm', name: '小军', description: '标准正式' }
}

// 默认语音配置
const DEFAULT_VOICE_SETTINGS = {
  speed: 1,
  volume: 50,
  audioType: 'wav'
}

// 将自定义配置转换为DUI格式
function convertVoiceConfig(config: any) {
  const voiceId = config.voiceId || 'xiaoling'
  const voiceInfo = VOICE_OPTIONS[voiceId as keyof typeof VOICE_OPTIONS] || VOICE_OPTIONS.xiaoling
  
  return {
    voiceId: voiceInfo.id,
    speed: config.speed || 1,
    volume: config.volume || 50,
    audioType: 'wav'
  }
}

// 调用DUI免费TTS API
async function generateSpeech(text: string, voiceSettings: any) {
  // 构建请求URL
  const params = new URLSearchParams({
    voiceId: voiceSettings.voiceId,
    text: text.substring(0, 200), // DUI API限制200字符
    speed: voiceSettings.speed.toString(),
    volume: voiceSettings.volume.toString(),
    audioType: voiceSettings.audioType
  })
  
  const url = `${DUI_TTS_BASE_URL}?${params.toString()}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  if (!response.ok) {
    console.error('DUI TTS API错误:', response.status, response.statusText)
    throw new Error(`语音生成失败: ${response.status} ${response.statusText}`)
  }

  return response
}

// 估算音频时长（基于文本长度）
function estimateAudioDuration(text: string): number {
  // 平均每分钟150个单词，每个单词平均5个字符
  const wordsPerMinute = 150
  const charactersPerWord = 5
  const charactersPerMinute = wordsPerMinute * charactersPerWord
  
  const estimatedMinutes = text.length / charactersPerMinute
  return Math.max(1, Math.ceil(estimatedMinutes * 60)) // 至少1秒
}

export async function POST(request: NextRequest) {
  try {
    const { text, voiceConfig } = await request.json()

    // 验证输入
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: '文本内容不能为空' }, { status: 400 })
    }

    if (text.length > 200) {
      return NextResponse.json({ error: '文本长度不能超过200字符（DUI API限制）' }, { status: 400 })
    }

    // 转换语音设置
    const voiceSettings = convertVoiceConfig(voiceConfig || {})

    console.log('开始生成语音:', {
      textLength: text.length,
      voiceId: voiceSettings.voiceId,
      voiceSettings
    })

    // 调用DUI免费TTS API生成语音
    const audioResponse = await generateSpeech(
      text,
      voiceSettings
    )

    // 获取音频数据
    const audioBuffer = await audioResponse.arrayBuffer()
    const audioSize = audioBuffer.byteLength

    if (audioSize === 0) {
      throw new Error('生成的音频文件为空')
    }

    // 生成音频文件ID和名称
    const audioId = uuidv4()
    const fileName = `audio_${audioId}.wav`

    // 将音频转换为 base64 格式返回
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')
    const audioDataUrl = `data:audio/wav;base64,${audioBase64}`

    return NextResponse.json({
      success: true,
      audioUrl: audioDataUrl,
      downloadUrl: audioDataUrl,
      duration: null, // DUI API 不提供时长信息
      format: 'wav',
      size: audioBuffer.byteLength
    })

  } catch (error) {
    console.error('TTS处理失败:', error)
    
    // 根据错误类型返回不同的错误信息
    let errorMessage = '语音生成失败'
    let statusCode = 500

    const errorMsg = error instanceof Error ? error.message : ''

    if (errorMsg.includes('语音生成失败')) {
      errorMessage = '语音服务暂时不可用，请稍后重试'
      statusCode = 503
    } else if (errorMsg.includes('网络') || errorMsg.includes('fetch')) {
      errorMessage = '网络连接失败，请检查网络后重试'
      statusCode = 503
    } else if (errorMsg.includes('200字符')) {
      errorMessage = '文本过长，请分段处理'
      statusCode = 400
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorMsg : undefined
    }, { status: statusCode })
  }
}