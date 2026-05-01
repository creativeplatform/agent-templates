'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, Wand2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'

type EditField = 'audience' | 'tension' | 'purpleCow' | 'sources'

export default function Zone1StrategicInputs() {
  const {
    audience,
    tension,
    purpleCow,
    sources,
    markdownContent,
    updateAudience,
    updateTension,
    updatePurpleCow,
    addSource,
    removeSource,
    updateMarkdown,
  } = useStore()

  const [editMode, setEditMode] = useState<EditField | null>(null)
  const [newSource, setNewSource] = useState('')

  const handleAddSource = () => {
    if (newSource.trim()) {
      addSource(newSource.trim())
      setNewSource('')
      toast.success('Source added')
    }
  }

  const generateNewsletter = async () => {
    if (!audience || !tension || !purpleCow) {
      toast.error('Complete Audience, Tension, and Purple Cow to generate')
      return
    }

    toast.loading('Crafting your remarkable newsletter...')
    
    // Simulate AI generation with strategic inputs
    const sourcesText = sources.length > 0 ? sources.join(', ') : 'general knowledge'

    // For now, show a placeholder
    setTimeout(() => {
      const generatedContent = `# Remarkable Newsletter

## Hook: Your Audience Pain Point
${tension}

## The Remarkable Angle
${purpleCow}

## Key Insights
- Generated from your strategic inputs
- Sources: ${sourcesText}
- Tailored for: ${audience}

## Call to Action
Share this with someone in your network.

---

*This newsletter was strategically crafted by the Remarkability Engine.*`

      updateMarkdown(generatedContent)
      toast.success('Newsletter draft created! Edit and refine below.')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Strategic Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Audience */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Audience</CardTitle>
            <CardDescription className="text-slate-400">
              Who are you writing for?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editMode === 'audience' ? (
              <Input
                autoFocus
                placeholder="e.g., Startup founders interested in AI"
                value={audience}
                onChange={(e) => updateAudience(e.target.value)}
                onBlur={() => setEditMode(null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            ) : (
              <p
                onClick={() => setEditMode('audience')}
                className="text-slate-300 cursor-pointer hover:text-white min-h-10 flex items-center transition"
              >
                {audience || <span className="text-slate-500 italic">Click to add...</span>}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Core Tension */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Core Tension</CardTitle>
            <CardDescription className="text-slate-400">
              What problem do they face?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editMode === 'tension' ? (
              <Textarea
                autoFocus
                placeholder="e.g., Building sustainable growth without burning out"
                value={tension}
                onChange={(e) => updateTension(e.target.value)}
                onBlur={() => setEditMode(null)}
                className="bg-slate-700 border-slate-600 text-white min-h-20 resize-none"
              />
            ) : (
              <p
                onClick={() => setEditMode('tension')}
                className="text-slate-300 cursor-pointer hover:text-white min-h-10 flex items-center transition"
              >
                {tension || <span className="text-slate-500 italic">Click to add...</span>}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Purple Cow */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Purple Cow</CardTitle>
            <CardDescription className="text-slate-400">
              What makes this remarkable?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editMode === 'purpleCow' ? (
              <Textarea
                autoFocus
                placeholder="e.g., Unconventional insights combined with real-world results"
                value={purpleCow}
                onChange={(e) => updatePurpleCow(e.target.value)}
                onBlur={() => setEditMode(null)}
                className="bg-slate-700 border-slate-600 text-white min-h-20 resize-none"
              />
            ) : (
              <p
                onClick={() => setEditMode('purpleCow')}
                className="text-slate-300 cursor-pointer hover:text-white min-h-10 flex items-center transition"
              >
                {purpleCow || <span className="text-slate-500 italic">Click to add...</span>}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sources */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Sources</CardTitle>
            <CardDescription className="text-slate-400">
              Research & inspiration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sources.length > 0 && (
              <div className="space-y-2">
                {sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-700 text-slate-200 p-2 rounded flex items-center justify-between text-sm"
                  >
                    <span>{source}</span>
                    <button
                      onClick={() => removeSource(idx)}
                      className="text-slate-400 hover:text-red-400 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Add a source..."
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSource()}
                className="bg-slate-700 border-slate-600 text-white text-sm flex-1"
              />
              <Button
                onClick={handleAddSource}
                size="sm"
                className="bg-slate-600 hover:bg-slate-500"
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateNewsletter}
        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-6 text-lg gap-2 border border-slate-600"
      >
        <Wand2 size={20} />
        Generate Newsletter Draft
      </Button>

      {/* Newsletter Editor */}
      {markdownContent && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Newsletter Editor</CardTitle>
            <CardDescription className="text-slate-400">
              Edit your content. All changes are preserved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={markdownContent}
              onChange={(e) => updateMarkdown(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white font-mono text-sm min-h-96 resize-vertical"
              placeholder="Your newsletter content will appear here..."
            />
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => toast.success('Ready for Zone 2 assets!')}
                className="bg-slate-600 hover:bg-slate-500 gap-2"
              >
                <ArrowRight size={16} />
                Proceed to Zone 2
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(markdownContent)
                  toast.success('Copied to clipboard!')
                }}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Copy Markdown
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
