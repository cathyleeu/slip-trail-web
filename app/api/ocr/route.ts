import { parseReceipt } from '@lib/groq'
import { execFile } from 'child_process'
import { unlink, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const file = form.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  // 임시 파일 저장
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const tempImagePath = path.join('/tmp', `receipt-${Date.now()}.jpg`)
  await writeFile(tempImagePath, buffer)

  try {
    // Python OCR 실행
    const pythonPath = path.join(process.cwd(), '.venv', 'bin', 'python3')
    const scriptPath = path.join(process.cwd(), 'python', 'ocr.py')

    const { stdout, stderr } = await execFileAsync(pythonPath, [scriptPath, tempImagePath])

    if (stderr) {
      console.warn('OCR stderr:', stderr)
    }

    // JSON 파싱 시도
    try {
      const ocrResult = JSON.parse(stdout.trim())
      const rawText = ocrResult.map((item: { text: string }) => item.text).join('\n')
      const parsedReceipt = await parseReceipt(rawText)

      return NextResponse.json({
        success: true,
        raw_text: rawText,
        data: ocrResult,
        parsed_receipt: parsedReceipt,
      })
    } catch {
      // JSON 파싱 실패 시 raw text 그대로 반환
      return NextResponse.json({
        success: true,
        raw_text: stdout.trim(),
      })
    }
  } catch (error) {
    console.error('OCR Error:', error)
    return NextResponse.json(
      { error: 'OCR failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    // 임시 파일 삭제
    await unlink(tempImagePath).catch((err) => console.error('Failed to delete temp file:', err))
  }
}
