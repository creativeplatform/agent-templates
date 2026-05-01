'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Download, Trash2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'

export default function Zone2ClawAssets() {
  const { markdownContent, generatedAssets, addAsset, removeAsset } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)

  const generateAssets = () => {
    if (!markdownContent.trim()) {
      toast.error('Create newsletter content in Zone 1 first')
      return
    }

    setIsGenerating(true)
    toast.loading('The Claw is working...')

    setTimeout(() => {
      const headline = '📢 ' + markdownContent.substring(0, 60) + '... Discover the remarkable angle'
      const socialRiff = "🎯 Key insight: " + markdownContent.substring(20, 60) + "\n\nHere's how to think about it differently.\n\nThread 🧵"
      const visualBrief = 'Visual Concept: Bold contrasting colors showing transformation. Center: key insight. Borders: supporting data points.'

      addAsset({ type: 'image', title: 'Email Headline', content: headline })
      addAsset({ type: 'riff', title: 'Social Thread', content: socialRiff })
      addAsset({ type: 'image', title: 'Visual Brief', content: visualBrief })

      setIsGenerating(false)
      toast.success('3 assets generated! Customize and share.')
    }, 1200)
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  const getAssetIcon = (type: 'image' | 'riff') => {
    return type === 'image' ? '🖼️' : '💬'
  }

  const getAssetColor = (type: 'image' | 'riff') => {
    return 'bg-slate-800 border-slate-600'
  }

  return (
    <div className="space-y-6">
      {/* Newsletter Content Input */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles size={20} className="text-slate-400" />
            The Claw: Asset Generator
          </CardTitle>
          <CardDescription className="text-slate-400">
            Paste your newsletter content and generate headlines, social riffs, and visual briefs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-700 border border-slate-600 rounded p-3 text-sm text-slate-300">
            <strong>Your Newsletter Content:</strong>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed max-h-24 overflow-y-auto">
              {markdownContent || '(No content yet - create it in Zone 1)'}
            </p>
          </div>

          <Button
            onClick={generateAssets}
            disabled={!markdownContent.trim() || isGenerating}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-6 text-lg gap-2 border border-slate-600 disabled:opacity-50"
          >
            <Sparkles size={20} />
            {isGenerating ? 'Generating...' : 'Generate Assets'}
          </Button>
        </CardContent>
      </Card>

      {/* Assets Gallery */}
      {generatedAssets.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Generated Assets ({generatedAssets.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedAssets.map((asset) => (
              <Card
                key={asset.id}
                className={`${getAssetColor(asset.type)} border relative overflow-hidden group`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-2xl mb-1">{getAssetIcon(asset.type)}</div>
                      <CardTitle className="text-sm text-slate-200">
                        {asset.title}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAsset(asset.id)}
                      className="opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {asset.content}
                  </p>
                  <div className="flex gap-2 pt-2 border-t border-slate-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(asset.content)}
                      className="text-slate-300 hover:text-white flex-1 gap-1"
                    >
                      <Copy size={14} />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-white flex-1 gap-1"
                    >
                      <Download size={14} />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {generatedAssets.length === 0 && (
        <Card className="bg-slate-800 border-slate-700 border-dashed">
          <CardContent className="py-12 text-center">
            <Sparkles className="mx-auto mb-4 text-slate-600" size={32} />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No assets yet</h3>
            <p className="text-slate-500">
              Click "Generate Assets" to create headlines, social riffs, and visual briefs
            </p>
          </CardContent>
        </Card>
      )}

      {/* Asset Management Tips */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Asset Management Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          <p>• <strong>Headlines:</strong> Use for email subject lines and main promotions</p>
          <p>• <strong>Social Riffs:</strong> Expand on Twitter/LinkedIn threads</p>
          <p>• <strong>Visual Briefs:</strong> Guide your designer on key visual concepts</p>
          <p>• Copy any asset directly and it's ready to share</p>
        </CardContent>
      </Card>
    </div>
  )
}
