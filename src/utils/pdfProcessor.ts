// 动态导入PDF.js，避免服务器端渲染问题
let pdfjsLib: any = null

// 初始化PDF.js（仅在客户端）
const initPDFJS = async () => {
  if (typeof window === 'undefined') {
    throw new Error('PDF处理仅支持客户端环境')
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    // 设置PDF.js worker路径
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  }
  
  return pdfjsLib
}

/**
 * 从PDF文件中提取文本内容
 * @param file PDF文件对象
 * @returns Promise<string> 提取的文本内容
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // 初始化PDF.js
    const pdfjs = await initPDFJS()
    
    // 将文件转换为ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // 加载PDF文档
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    
    // 遍历所有页面
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // 提取页面文本
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      fullText += pageText + '\n'
    }
    
    return fullText.trim()
  } catch (error) {
    console.error('PDF文本提取失败:', error)
    throw new Error('PDF文件解析失败，请确保文件格式正确')
  }
}

/**
 * 检查是否为PDF文件
 * @param file 文件对象
 * @returns boolean
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}