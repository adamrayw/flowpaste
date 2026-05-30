'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BookOpen, CheckSquare, Code2, Copy, FileText, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type ToolType = 'summary' | 'explain_code' | 'generate_documentation' | 'extract_action_items'

type ToolItem = {
  id: ToolType
  title: string
  description: string
  icon: typeof Sparkles
}

type PasteOption = {
  id: string
  title: string
  language: string
}

const tools: ToolItem[] = [
  {
    id: 'summary',
    title: 'AI Summary',
    description: 'Concise summary of purpose, flow, and key points.',
    icon: Sparkles,
  },
  {
    id: 'explain_code',
    title: 'AI Explain Code',
    description: 'Developer-friendly explanation of how code works.',
    icon: Code2,
  },
  {
    id: 'generate_documentation',
    title: 'AI Generate Documentation',
    description: 'Generate Markdown docs with usage and edge cases.',
    icon: BookOpen,
  },
  {
    id: 'extract_action_items',
    title: 'AI Extract Action Items',
    description: 'Extract practical checklist and priorities.',
    icon: CheckSquare,
  },
]

function getToolLabel(id: ToolType) {
  return tools.find((tool) => tool.id === id)?.title ?? id
}

function isToolType(value: string): value is ToolType {
  return tools.some((tool) => tool.id === value)
}

export default function AIToolsPage() {
  const searchParams = useSearchParams()
  const [selectedTool, setSelectedTool] = useState<ToolType>('summary')
  const [pastes, setPastes] = useState<PasteOption[]>([])
  const [selectedPasteId, setSelectedPasteId] = useState('')
  const [customContent, setCustomContent] = useState('')
  const [instruction, setInstruction] = useState('')
  const [result, setResult] = useState('')
  const [modelUsed, setModelUsed] = useState('')
  const [usageText, setUsageText] = useState('')
  const [isLoadingPastes, setIsLoadingPastes] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')
  const hasInitializedTool = useRef(false)
  const hasInitializedPaste = useRef(false)
  const hasAutoRan = useRef(false)

  const requestedTool = searchParams.get('tool')
  const requestedPasteId = searchParams.get('pasteId')
  const shouldAutoRun = searchParams.get('run') === '1'

  useEffect(() => {
    let active = true

    const loadPastes = async () => {
      try {
        setIsLoadingPastes(true)
        const response = await fetch('/api/pastes', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load your pastes')
        }

        const data = (await response.json()) as {
          pastes: Array<{ id: string; title: string; language: string }>
        }

        if (!active) return
        setPastes(data.pastes.map((paste) => ({ id: paste.id, title: paste.title, language: paste.language })))
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load your pastes')
        }
      } finally {
        if (active) {
          setIsLoadingPastes(false)
        }
      }
    }

    void loadPastes()
    return () => {
      active = false
    }
  }, [])

  const canRun = useMemo(() => Boolean(selectedPasteId || customContent.trim()), [customContent, selectedPasteId])

  const runAI = useCallback(async () => {
    if (!canRun || isRunning) {
      return
    }

    setError('')
    setIsRunning(true)

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: selectedTool,
          pasteId: selectedPasteId || undefined,
          content: customContent.trim() || undefined,
          instruction: instruction.trim() || undefined,
        }),
      })

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string
            result?: string
            model?: string
            usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null
          }
        | null

      if (!response.ok || !data?.result) {
        throw new Error(data?.message ?? 'Failed to run AI tool')
      }

      setResult(data.result)
      setModelUsed(data.model ?? '')
      if (data.usage?.total_tokens) {
        setUsageText(
          `Prompt ${data.usage.prompt_tokens ?? 0} • Completion ${data.usage.completion_tokens ?? 0} • Total ${data.usage.total_tokens}`,
        )
      } else {
        setUsageText('')
      }
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'Failed to run AI tool')
    } finally {
      setIsRunning(false)
    }
  }, [canRun, customContent, instruction, isRunning, selectedPasteId, selectedTool])

  useEffect(() => {
    if (hasInitializedTool.current) {
      return
    }

    if (requestedTool && isToolType(requestedTool)) {
      setSelectedTool(requestedTool)
    }

    hasInitializedTool.current = true
  }, [requestedTool])

  useEffect(() => {
    if (hasInitializedPaste.current || !requestedPasteId || isLoadingPastes) {
      return
    }

    const pasteExists = pastes.some((paste) => paste.id === requestedPasteId)
    if (pasteExists) {
      setSelectedPasteId(requestedPasteId)
    }

    hasInitializedPaste.current = true
  }, [isLoadingPastes, pastes, requestedPasteId])

  useEffect(() => {
    if (!shouldAutoRun || hasAutoRan.current || isLoadingPastes || !selectedPasteId || isRunning) {
      return
    }

    hasAutoRan.current = true
    void runAI()
  }, [isLoadingPastes, isRunning, runAI, selectedPasteId, shouldAutoRun])

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-accent" />
          AI Tools
        </h1>
        <p className="text-muted-foreground">OpenRouter-powered analysis for summary, explanation, docs, and action items.</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon
          const active = selectedTool === tool.id
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setSelectedTool(tool.id)}
              className={`text-left border rounded-xl p-4 transition-colors ${active ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'}`}
            >
              <Icon className="w-5 h-5 text-accent" />
              <p className="font-semibold mt-3">{tool.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
            </button>
          )
        })}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Input</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Tool</label>
            <div className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm">
              {getToolLabel(selectedTool)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">From Your Paste (Optional)</label>
            <select
              value={selectedPasteId}
              onChange={(e) => setSelectedPasteId(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm"
              disabled={isLoadingPastes}
            >
              <option value="">{isLoadingPastes ? 'Loading pastes...' : 'Choose a paste'}</option>
              {pastes.map((paste) => (
                <option key={paste.id} value={paste.id}>
                  {paste.title} ({paste.language})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Content (Optional)</label>
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder="Paste raw code or text here..."
              rows={9}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-muted-foreground">Use either paste selection, custom content, or both.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Instruction (Optional)</label>
            <Input
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., focus on security and performance risks"
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <Button className="w-full gap-2" onClick={runAI} disabled={!canRun || isRunning}>
            <Sparkles className="w-4 h-4" />
            {isRunning ? 'Running AI...' : 'Run AI Tool'}
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Result</h3>

          {result ? (
            <div className="space-y-3">
              <div className="border border-border rounded-lg p-4 bg-card/50 max-h-[520px] overflow-auto">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {modelUsed ? <span>Model: {modelUsed}</span> : null}
                {usageText ? <span>{usageText}</span> : null}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigator.clipboard.writeText(result)}>
                  <Copy className="w-4 h-4" />
                  Copy Result
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setCustomContent(result)
                    setSelectedPasteId('')
                  }}
                >
                  <FileText className="w-4 h-4" />
                  Use as New Input
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">Run an AI tool to see the output here.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
