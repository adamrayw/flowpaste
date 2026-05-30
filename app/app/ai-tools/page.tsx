'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sparkles, Copy, ArrowRight, Zap, BookOpen, Bug, Lightbulb, Code2 } from 'lucide-react'
import { useState } from 'react'

const aiTools = [
  {
    icon: Sparkles,
    title: 'Code Summary',
    description: 'Get a concise explanation of what your code does',
    action: 'Summarize',
    example: 'Explains the purpose and functionality of code blocks'
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Generate documentation and comments for your code',
    action: 'Generate Docs',
    example: 'Creates JSDoc, docstrings, or inline comments'
  },
  {
    icon: Bug,
    title: 'Bug Detection',
    description: 'Identify potential bugs and security issues',
    action: 'Scan Code',
    example: 'Detects common errors and anti-patterns'
  },
  {
    icon: Lightbulb,
    title: 'Optimization',
    description: 'Get suggestions to improve code performance',
    action: 'Optimize',
    example: 'Recommends faster algorithms and better practices'
  },
  {
    icon: Code2,
    title: 'Refactoring',
    description: 'Suggestions for improving code structure',
    action: 'Refactor',
    example: 'Applies modern patterns and best practices'
  },
  {
    icon: Zap,
    title: 'Complexity Analysis',
    description: 'Understand time and space complexity',
    action: 'Analyze',
    example: 'Explains Big O notation and optimization opportunities'
  }
]

const recentAnalyses = [
  {
    id: 1,
    pasteTitle: 'React Component Hook',
    tool: 'Code Summary',
    result: 'A custom React hook that manages async operations with error handling and loading states. Implements cleanup with AbortController for request cancellation.',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    pasteTitle: 'Fibonacci Function',
    tool: 'Optimization',
    result: 'Current implementation has O(2^n) time complexity. Consider using memoization or dynamic programming for O(n) performance.',
    timestamp: '1 day ago'
  },
  {
    id: 3,
    pasteTitle: 'Database Query',
    tool: 'Bug Detection',
    result: 'Potential SQL injection vulnerability detected. Use parameterized queries instead of string concatenation.',
    timestamp: '3 days ago'
  }
]

export default function AITools() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async (tool: string) => {
    setLoading(true)
    // Mock AI analysis
    setTimeout(() => {
      setLoading(false)
      setResult(`AI Analysis using ${tool}: This is a mock result. In a real application, this would call an AI API like OpenAI's GPT-4 or Claude to analyze your code.`)
    }, 1500)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-accent" />
          AI Tools
        </h1>
        <p className="text-muted-foreground">Analyze, improve, and understand your code with AI assistance</p>
      </div>

      {/* Main Tools Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiTools.map((tool) => {
          const Icon = tool.icon
          return (
            <Card
              key={tool.title}
              className="p-6 space-y-4 hover:border-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedTool(tool.title)}
            >
              <div className="space-y-2">
                <Icon className="w-6 h-6 text-accent" />
                <h3 className="font-semibold text-lg">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
              <p className="text-xs text-muted-foreground italic">{tool.example}</p>
              <Button size="sm" className="w-full gap-2">
                {tool.action}
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Card>
          )
        })}
      </div>

      {/* Analysis Panel */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Paste Your Code</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select a tool or paste code</label>
              <select className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm">
                <option>Select AI Tool</option>
                {aiTools.map(tool => (
                  <option key={tool.title} value={tool.title}>{tool.title}</option>
                ))}
              </select>
            </div>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              rows={8}
            />
            <Button
              onClick={() => handleAnalyze(selectedTool || 'Analysis')}
              disabled={loading || !codeInput}
              className="w-full gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Analyzing...' : 'Analyze Code'}
            </Button>
          </div>
        </Card>

        {/* Output */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">AI Analysis Result</h3>
          {result ? (
            <div className="space-y-3">
              <div className="bg-card/50 border border-border rounded-lg p-4 text-sm space-y-3">
                <p className="text-foreground leading-relaxed">{result}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigator.clipboard.writeText(result)}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">Save to Paste</Button>
              </div>
            </div>
          ) : (
            <div className="bg-card/50 border border-dashed border-border rounded-lg p-8 text-center space-y-2">
              <p className="text-muted-foreground">Select a tool and paste your code to get started</p>
              <p className="text-xs text-muted-foreground">AI analysis results will appear here</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Analyses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Analyses</h3>
        <div className="space-y-3">
          {recentAnalyses.map((analysis) => (
            <Card key={analysis.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold">{analysis.pasteTitle}</h4>
                  <p className="text-xs text-muted-foreground">{analysis.tool}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{analysis.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.result}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">View Full</Button>
                <Button variant="outline" size="sm">Save</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pro Features */}
      <Card className="p-6 space-y-4 border-accent/20 bg-accent/5">
        <h3 className="font-semibold">Upgrade to Pro</h3>
        <p className="text-sm text-muted-foreground">Unlock advanced AI features including batch analysis, custom rules, and priority processing</p>
        <Button className="gap-2">
          <Sparkles className="w-4 h-4" />
          Upgrade to Pro
        </Button>
      </Card>
    </div>
  )
}
