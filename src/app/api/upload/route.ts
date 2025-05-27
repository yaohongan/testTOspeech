import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
// import PDFParser from 'pdf2json'
// import mammoth from 'mammoth'

// 支持的文件类型
const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  // 'application/msword': 'doc',
  'text/plain': 'txt',
  'text/markdown': 'md'
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// PDF文件处理：返回特殊标识，让客户端使用PDF.js处理
async function parsePDF(buffer: Buffer): Promise<string> {
  // 返回特殊标识，表示需要客户端处理
  return '__PDF_CLIENT_PROCESSING__'
}

// 解析Word文件 - 暂时禁用
// async function parseWord(buffer: Buffer): Promise<string> {
//   try {
//     const result = await mammoth.extractRawText({ buffer })
//     return result.value
//   } catch (error) {
//     console.error('Word解析失败:', error)
//     throw new Error('Word文件解析失败')
//   }
// }

// 解析文本文件
function parseText(buffer: Buffer): string {
  try {
    return buffer.toString('utf-8')
  } catch (error) {
    console.error('文本解析失败:', error)
    throw new Error('文本文件解析失败')
  }
}

// 根据文件类型解析文本
async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case 'application/pdf':
      return await parsePDF(buffer)
    // case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    // case 'application/msword':
    //   return await parseWord(buffer)
    case 'text/plain':
    case 'text/markdown':
      return parseText(buffer)
    default:
      throw new Error('支持的文件格式: PDF (.pdf), 文本文件 (.txt, .md)')
  }
}

// 验证文件
function validateFile(file: File) {
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // 检查文件类型
  if (!SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]) {
    throw new Error('不支持的文件格式')
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    // 解析表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '没有找到上传的文件' }, { status: 400 })
    }

    // 验证文件
    validateFile(file)

    // 读取文件内容
    const buffer = Buffer.from(await file.arrayBuffer())

    // 提取文本内容
    const extractedText = await extractText(buffer, file.type)

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: '无法从文件中提取文本内容' }, { status: 400 })
    }

    // 生成文件ID
    const fileId = uuidv4()
    
    // 构建文件数据（不需要外部存储）
    const fileData = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      url: null // 不使用外部存储
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      fileData,
      text: extractedText,
      message: '文件上传和解析成功'
    })

  } catch (error) {
    console.error('文件上传处理失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '文件处理失败',
      message: '请检查文件格式和大小后重试'
    }, { status: 500 })
  }
}