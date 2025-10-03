import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function saveTempFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cv-'))
  const filePath = path.join(tmpDir, file.name)
  await fs.writeFile(filePath, buffer)
  return filePath
}

function resolvePythonBin(): string[] {
  const envBin = process.env.PYTHON_BIN?.trim()
  const candidates: string[] = []
  if (envBin) candidates.push(envBin)
  // Prefer python3 on macOS/Linux environments
  candidates.push('python3', 'python', 'py')
  // De-duplicate while preserving order
  return Array.from(new Set(candidates))
}

function runPythonScore(pdfPath: string, sector: string, jdText?: string, jdFilePath?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'cv', 'ats_scoring_enhanced.py')
    const args = [scriptPath, '--file', pdfPath]
    if (sector) args.push('--sector', sector)
    if (jdText && jdText.trim().length > 0) {
      args.push('--jd-text', jdText)
    } else if (jdFilePath) {
      args.push('--jd-file', jdFilePath)
    }

    const candidates = resolvePythonBin()
    let started = false
    let py: ReturnType<typeof spawn> | null = null

    const tryStart = (bins: string[]) => {
      if (!bins.length) {
        reject(new Error('No Python interpreter found. Set PYTHON_BIN or add python/py to PATH.'))
        return
      }
      const bin = bins[0]
      py = spawn(bin, args, { env: { ...process.env, PYTHONUTF8: '1' } })
      started = true
      attach(py!, bins.slice(1))
    }

    const attach = (proc: ReturnType<typeof spawn>, fallbacks: string[]) => {
      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('error', (err) => {
        // Try fallback bin
        if (fallbacks.length) {
          tryStart(fallbacks)
        } else {
          const message = stderr && stderr.trim().length > 0
            ? stderr
            : `Failed to start Python process${err?.message ? `: ${err.message}` : ''}. Tried: ${resolvePythonBin().join(', ')}`
          reject(new Error(message))
        }
      })

      proc.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(stderr || `Python exited with code ${code}`))
        }
        try {
          const trimmed = stdout.trim()
          const jsonStart = trimmed.indexOf('{')
          const jsonEnd = trimmed.lastIndexOf('}')
          const jsonText = jsonStart >= 0 ? trimmed.slice(jsonStart, jsonEnd + 1) : trimmed
          const json = JSON.parse(jsonText)
          resolve(json)
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${stdout}\nErr: ${e}`))
        }
      })
    }

    tryStart(candidates)

  })
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    const sector = (form.get('sector') as string | null) || 'INFORMATION-TECHNOLOGY'
    const jdText = (form.get('jd_text') as string | null) || undefined
    const jdFile = (form.get('jd_file') as File | null) || null

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const tempPath = await saveTempFile(file)
    const jdTempPath = jdFile ? await saveTempFile(jdFile) : undefined
    try {
      const result = await runPythonScore(tempPath, sector, jdText, jdTempPath)
      return NextResponse.json({ ok: true, result })
    } finally {
      // Best-effort cleanup
      try {
        await fs.unlink(tempPath)
      } catch {}
      if (jdTempPath) {
        try { await fs.unlink(jdTempPath) } catch {}
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}


