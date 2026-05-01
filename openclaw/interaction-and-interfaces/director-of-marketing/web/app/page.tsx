'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import {
  PenTool,
  Users,
  Zap,
  Image as ImageIcon,
  Link as LinkIcon,
  Send,
  Plus,
  Download,
  RefreshCw,
  DollarSign,
  Target,
  Share2,
  AlertCircle,
  CheckCircle2,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'

const MarkdownEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

type RightTab = 'assets' | 'revenue' | 'deploy'

const SPONSORS = [
  { id: 'sponsor_1', name: 'Paragraph.xyz', type: 'Web3 Publishing', tag: '{{sponsor_paragraph}}' },
  { id: 'sponsor_2', name: 'Miro', type: 'Visual Workspace', tag: '{{sponsor_miro}}' },
] as const

export default function Home() {
  const { resolvedTheme } = useTheme()
  const {
    audience,
    tension,
    purpleCow,
    sources,
    markdownContent,
    generatedAssets,
    updateAudience,
    updateTension,
    updatePurpleCow,
    setSources,
    updateMarkdown,
    addAsset,
  } = useStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState<RightTab>('assets')
  const [metrics, setMetrics] = useState({ consistency: 85, velocity: 12 })
  const [smtpEmails, setSmtpEmails] = useState('')

  const sourcesField = sources.join('\n')

  const handleGenerateDraft = () => {
    if (!audience.trim() || !tension.trim() || !purpleCow.trim()) {
      toast.error('Complete Empathy Filter, Strategic Tension, and Purple Cow first.')
      return
    }

    setIsGenerating(true)
    toast.loading('Assembling riffs…')

    window.setTimeout(() => {
      const sourcesText = sources.length > 0 ? sources.join(', ') : 'curated sources'
      updateMarkdown(`# The End of "Good Enough" UI

There's a fundamental misunderstanding about what people want.

They don't want more features. They want to feel understood. When we build for "everyone," we build for no one. This is the trap of the safe center.

**Audience:** ${audience}
**Tension:** ${tension}
**Remarkable edge:** ${purpleCow}
**Sources:** ${sourcesText}

{{sponsor_paragraph}}

If your product was gone tomorrow, who would miss it?

The brave choice isn't to add another button. The brave choice is to ask: "What is this actually for?" and "Who exactly is this for?"

Make a remark. Make a ruckus.

---

*If this resonated, share it with someone who needs to stop playing it safe.*`)

      setIsGenerating(false)
      setMetrics({ consistency: 94, velocity: 88 })
      toast.success('Draft ready — edit in the center panel.')
    }, 1500)
  }

  const handleGenerateMoreAssets = () => {
    if (!markdownContent.trim()) {
      toast.error('Generate or write newsletter content first.')
      return
    }

    setIsGeneratingAssets(true)
    toast.loading('The Claw is generating assets…')

    window.setTimeout(() => {
      const headline = `📢 ${markdownContent.slice(0, 60)}${markdownContent.length > 60 ? '…' : ''}`
      const socialRiff = `🎯 Key insight: ${markdownContent.slice(20, 80)}…\n\nHere's how to think about it differently.\n\nThread 🧵`
      addAsset({ type: 'image', title: 'Promo visual', content: headline })
      addAsset({ type: 'riff', title: 'Social riff', content: socialRiff })
      setIsGeneratingAssets(false)
      toast.success('New assets added.')
    }, 1200)
  }

  const insertSponsor = (tag: string) => {
    updateMarkdown(`${markdownContent.trimEnd()}\n\n${tag}\n\n`)
    toast.success('Sponsor tag inserted.')
  }

  const handleExportMarkdown = () => {
    toast.info('Exporting newsletter as .md for your archives.')
  }

  const copyText = (text: string) => {
    void navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard.')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-900">Remarkability Engine</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">The Permission Hub</p>
          </div>
        </div>
        <div className="flex space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Consistency Score</span>
            <div className="flex items-center space-x-1 text-green-600 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{metrics.consistency}%</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Word of Mouth Velocity</span>
            <div className="flex items-center space-x-1 text-purple-600 font-bold">
              <Zap className="w-4 h-4" />
              <span>{metrics.velocity}x</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex min-h-0 overflow-hidden">
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex flex-col shrink-0">
          <div className="p-6 space-y-6 flex-1">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Users className="w-4 h-4 mr-2 text-purple-500" />
                1. Empathy Filter
              </h2>
              <p className="text-xs text-slate-500 mb-2">Who is this for? (Psychographics)</p>
              <textarea
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                rows={2}
                value={audience}
                onChange={(e) => updateAudience(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                2. Strategic Tension
              </h2>
              <p className="text-xs text-slate-500 mb-2">What is the emotional lever?</p>
              <textarea
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                rows={2}
                value={tension}
                onChange={(e) => updateTension(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                3. The Purple Cow
              </h2>
              <p className="text-xs text-slate-500 mb-2">What makes this remarkable?</p>
              <textarea
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none"
                rows={2}
                value={purpleCow}
                onChange={(e) => updatePurpleCow(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <LinkIcon className="w-4 h-4 mr-2 text-blue-500" />
                4. Content Pool
              </h2>
              <p className="text-xs text-slate-500 mb-2">URLs or source material for the Claw (one per line)</p>
              <textarea
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-blue-600"
                rows={2}
                value={sourcesField}
                onChange={(e) => {
                  const lines = e.target.value
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean)
                  setSources(lines)
                }}
              />
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={isGenerating}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center group"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin text-purple-400" />
              ) : (
                <PenTool className="w-5 h-5 mr-2 text-purple-400 group-hover:scale-110 transition-transform" />
              )}
              {isGenerating ? 'Assembling Riffs...' : 'Engage The Claw'}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-wider">
              Powered by AI Engine
            </p>
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-white border-r border-slate-200 min-w-0 min-h-0">
          <div className="border-b border-slate-100 p-3 flex justify-between items-center bg-slate-50/50 shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-3">Markdown Editor</span>
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="text-xs flex items-center text-slate-500 hover:text-slate-800 px-3 py-1 rounded-md hover:bg-slate-200 transition-colors"
            >
              <Download className="w-3 h-3 mr-1" /> Export .md
            </button>
          </div>
          <div className="flex-1 p-6 min-h-0 flex flex-col">
            <div
              className="min-h-[320px] flex-1 flex flex-col [&_.w-md-editor]:min-h-[320px] [&_.w-md-editor]:flex-1"
              data-color-mode={resolvedTheme === 'dark' ? 'dark' : 'light'}
            >
              <MarkdownEditor
                value={markdownContent}
                onChange={(v) => updateMarkdown(v ?? '')}
                preview="live"
                textareaProps={{ placeholder: 'Your remarkable idea begins here...' }}
              />
            </div>
          </div>
        </section>

        <aside className="w-96 bg-slate-50 flex flex-col shrink-0 min-h-0">
          <div className="flex border-b border-slate-200 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setActiveRightTab('assets')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeRightTab === 'assets' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Assets
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('revenue')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeRightTab === 'revenue' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Revenue
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('deploy')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeRightTab === 'deploy' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Deploy
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {activeRightTab === 'assets' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Promotional Assets</h3>
                  <button
                    type="button"
                    onClick={handleGenerateMoreAssets}
                    disabled={isGeneratingAssets}
                    className="text-xs bg-white border border-slate-200 hover:border-purple-300 text-slate-600 px-3 py-1.5 rounded-lg flex items-center shadow-sm transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isGeneratingAssets ? 'animate-spin' : ''}`} />{' '}
                    Generate More
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedAssets.length === 0 && (
                    <p className="text-xs text-slate-500">No assets yet. Engage The Claw or use Generate More.</p>
                  )}
                  {generatedAssets.map((asset) => {
                    const isImageUrl = asset.type === 'image' && /^https?:\/\//i.test(asset.content.trim())
                    return (
                      <div key={asset.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
                        {asset.type === 'image' && isImageUrl ? (
                          <div className="space-y-3">
                            <div className="flex items-center text-xs text-slate-500 uppercase font-bold tracking-wider">
                              <ImageIcon className="w-3 h-3 mr-1" /> Visual Asset
                            </div>
                            <div className="relative rounded-lg overflow-hidden border border-slate-100 group-hover:shadow-md transition-shadow">
                              <img
                                src={asset.content.trim()}
                                alt={asset.title}
                                className="w-full h-32 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => copyText(asset.content)}
                                  className="bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-lg flex items-center shadow-xl"
                                >
                                  <Download className="w-4 h-4 mr-2" /> Copy URL
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : asset.type === 'image' ? (
                          <div className="space-y-2">
                            <div className="flex items-center text-xs text-slate-500 uppercase font-bold tracking-wider">
                              <ImageIcon className="w-3 h-3 mr-1" /> {asset.title}
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{asset.content}</p>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => copyText(asset.content)}
                                className="text-xs text-slate-400 hover:text-purple-600 font-medium"
                              >
                                Copy Text
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center text-xs text-slate-500 uppercase font-bold tracking-wider">
                              <Share2 className="w-3 h-3 mr-1" /> Social Riff
                            </div>
                            <p className="text-sm text-slate-700 italic border-l-2 border-purple-200 pl-3 whitespace-pre-wrap">
                              {asset.content}
                            </p>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => copyText(asset.content)}
                                className="text-xs text-slate-400 hover:text-purple-600 font-medium"
                              >
                                Copy Text
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeRightTab === 'revenue' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">The Slot Machine</h3>
                  <p className="text-xs text-slate-500 mb-4">Inject anticipated, personal, and relevant sponsors.</p>

                  <div className="space-y-3">
                    {SPONSORS.map((sponsor) => (
                      <div
                        key={sponsor.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{sponsor.name}</p>
                          <p className="text-xs text-slate-500">{sponsor.type}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => insertSponsor(sponsor.tag)}
                          className="bg-slate-100 hover:bg-green-100 text-slate-600 hover:text-green-700 p-2 rounded-lg transition-colors flex items-center text-xs font-bold shrink-0"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Inject
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5">
                  <div className="flex items-center text-green-800 mb-2">
                    <Users className="w-5 h-5 mr-2" />
                    <h3 className="font-bold">Circle of Us (Referrals)</h3>
                  </div>
                  <p className="text-xs text-green-700/80 mb-4 leading-relaxed">
                    Automatically inject Paragraph SDK referral links to turn your 1,000 true fans into your sales
                    force.
                  </p>
                  <button
                    type="button"
                    onClick={() => insertSponsor('{{referral_footer_block}}')}
                    className="w-full bg-white border border-green-200 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 text-xs font-bold py-2 px-4 rounded-lg transition-all shadow-sm"
                  >
                    Add Referral Footer Block
                  </button>
                </div>
              </div>
            )}

            {activeRightTab === 'deploy' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                    Strategic
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center">
                    <Send className="w-4 h-4 mr-2 text-slate-900" />
                    Send via Paragraph
                  </h3>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                    Uses <code className="text-slate-700">paragraph post create</code>. Publishes to Web3 canonical link
                    and notifies your subscribed True Fans.
                  </p>
                  <button
                    type="button"
                    onClick={() => toast.info('Wire this to your Paragraph CLI or API when ready.')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-3 px-4 rounded-lg transition-all shadow-md flex justify-center items-center"
                  >
                    Publish to Paragraph
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    or
                  </span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                    Direct Permission Send
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Send directly via SMTP. Only paste emails of people who have explicitly asked to hear from you.
                  </p>
                  <textarea
                    className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-3 font-mono text-slate-600"
                    rows={3}
                    placeholder="Enter explicit permission emails (comma separated)..."
                    value={smtpEmails}
                    onChange={(e) => setSmtpEmails(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!smtpEmails.trim()) {
                        toast.error('Enter at least one email.')
                        return
                      }
                      toast.success('Newsletter queued for SMTP (demo).')
                    }}
                    className="w-full bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 text-sm font-bold py-2.5 px-4 rounded-lg transition-all shadow-sm"
                  >
                    Send Direct via SMTP
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}
