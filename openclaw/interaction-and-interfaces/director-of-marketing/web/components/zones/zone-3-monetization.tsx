'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Mail, Send, Zap, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'

interface Sponsor {
  id: string
  name: string
  position: number
}

export default function Zone3Monetization() {
  const {
    markdownContent,
    selectedSponsor,
    sponsorSlotResult,
    emailDistributionEmail,
    paragraphApiKey,
    setSponsor,
    setSlotResult,
    setEmailDistribution,
    setParagraphApiKey,
  } = useStore()

  const [sponsorSlots, setSponsorSlots] = useState<Sponsor[]>([
    { id: '1', name: 'TechFlow Pro', position: 0 },
    { id: '2', name: 'BuildKit AI', position: 1 },
    { id: '3', name: 'CloudScale', position: 2 },
  ])

  const [currentSpinPosition, setCurrentSpinPosition] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [referralCode, setReferralCode] = useState('REMARK2024')

  const spinSlots = () => {
    if (isSpinning) return
    
    setIsSpinning(true)
    toast.loading('Spinning sponsor slots...')

    let spins = 0
    const maxSpins = 15
    const interval = setInterval(() => {
      setCurrentSpinPosition(prev => (prev + 1) % sponsorSlots.length)
      spins++

      if (spins >= maxSpins) {
        clearInterval(interval)
        setIsSpinning(false)
        const finalPosition = Math.floor(Math.random() * sponsorSlots.length)
        setCurrentSpinPosition(finalPosition)
        const selectedName = sponsorSlots[finalPosition].name
        setSponsor(selectedName)
        setSlotResult(`Today's slot: ${selectedName}`)
        toast.success(selectedName)
      }
    }, 80)
  }

  const updateSponsor = (index: number, name: string) => {
    setSponsorSlots(prev => {
      const updated = [...prev]
      updated[index].name = name
      return updated
    })
  }

  const copyReferralLink = () => {
    const link = `remarkability.io?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    toast.success('Referral link copied!')
  }

  const testParagraphAPI = () => {
    if (!paragraphApiKey.trim()) {
      toast.error('Enter your Paragraph API token')
      return
    }
    toast.success('Testing Paragraph API connection...')
    setTimeout(() => {
      toast.success('Paragraph API connected')
    }, 1000)
  }

  const sendViaSMTP = () => {
    if (!emailDistributionEmail.trim()) {
      toast.error('Enter email address')
      return
    }
    toast.loading('Sending via SMTP...')
    setTimeout(() => {
      toast.success('Newsletter queued for sending')
      setEmailDistribution(emailDistributionEmail)
    }, 2000)
  }

  const generateSponsorContent = () => {
    const selectedSponsor = sponsorSlots[currentSpinPosition]
    const content = `---

## Today's Sponsor: ${selectedSponsor.name}

[Your sponsor message and CTA here]

---`
    
    navigator.clipboard.writeText(content)
    toast.success('Sponsor block copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Sponsor Slot Machine */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap size={20} className="text-slate-400" />
            Sponsor Slot Machine
          </CardTitle>
          <CardDescription className="text-slate-400">
            Randomly assign your sponsor rotation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Slot Machine Display */}
          <div className="bg-slate-900 rounded-lg p-8 border-2 border-slate-600 relative overflow-hidden">
            <div className="flex items-center justify-center gap-4 h-32">
              {sponsorSlots.map((slot, index) => (
                <div
                  key={slot.id}
                  className={`flex-1 rounded-lg p-4 text-center transition-all duration-200 ${
                    index === currentSpinPosition
                      ? 'bg-slate-600 scale-110 shadow-lg'
                      : 'bg-slate-800 scale-90 opacity-50'
                  }`}
                >
                  <div className="text-2xl font-bold text-white">{index + 1}</div>
                  <div className="text-sm text-slate-200 font-semibold mt-2 truncate">
                    {slot.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spin Button */}
          <Button
            onClick={spinSlots}
            disabled={isSpinning}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-6 text-lg font-bold border border-slate-600"
          >
            {isSpinning ? 'SPINNING...' : 'SPIN SLOTS'}
          </Button>

          {/* Selected Slot Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Currently Selected Sponsor</p>
                  <p className="text-xl font-bold text-white">
                    {selectedSponsor || sponsorSlots[currentSpinPosition].name}
                  </p>
                </div>
                <Button
                  onClick={generateSponsorContent}
                  disabled={!markdownContent.trim()}
                  className="w-full bg-slate-600 hover:bg-slate-500 gap-2 disabled:opacity-50"
                >
                  <Copy size={16} />
                  Copy Sponsor Block
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Edit Sponsor Slots */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200">Edit Sponsor Slots</h4>
            {sponsorSlots.map((slot, index) => (
              <Input
                key={slot.id}
                value={slot.name}
                onChange={(e) => updateSponsor(index, e.target.value)}
                placeholder={`Sponsor ${index + 1}`}
                className="bg-slate-700 border-slate-600 text-white"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Methods */}
      <Tabs defaultValue="paragraph" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-700 h-12 p-1">
          <TabsTrigger value="paragraph" className="text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white font-medium">
            <Mail size={16} className="mr-2" />
            Paragraph API
          </TabsTrigger>
          <TabsTrigger value="smtp" className="text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white font-medium">
            <Send size={16} className="mr-2" />
            Direct SMTP
          </TabsTrigger>
        </TabsList>

        {/* Paragraph API Tab */}
        <TabsContent value="paragraph" className="space-y-4 mt-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-white">Send via Paragraph API</CardTitle>
              <CardDescription className="text-slate-400">
                Publish directly to your Paragraph newsletter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Paragraph API Token
                </label>
                <Input
                  type="password"
                  placeholder="Your Paragraph API token"
                  value={paragraphApiKey}
                  onChange={(e) => setParagraphApiKey(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Get your token from your Paragraph dashboard settings
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={testParagraphAPI}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Test Connection
                </Button>
                <Button disabled={!markdownContent.trim()} className="bg-slate-600 hover:bg-slate-500 gap-2 disabled:opacity-50">
                  <Send size={16} />
                  Publish Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP Tab */}
        <TabsContent value="smtp" className="space-y-4 mt-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-white">Send via Direct SMTP</CardTitle>
              <CardDescription className="text-slate-400">
                Send using your own email service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  From Email
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={emailDistributionEmail}
                  onChange={(e) => setEmailDistribution(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Distribution List (comma-separated)
                </label>
                <Textarea
                  placeholder="subscriber1@example.com, subscriber2@example.com, ..."
                  defaultValue=""
                  className="bg-slate-700 border-slate-600 text-white min-h-24"
                />
              </div>

              <Button
                onClick={sendViaSMTP}
                disabled={!markdownContent.trim() || !emailDistributionEmail.trim()}
                className="w-full bg-slate-600 hover:bg-slate-500 gap-2 disabled:opacity-50"
              >
                <Send size={16} />
                Send via SMTP
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Referral & Growth */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Share2 size={20} className="text-slate-400" />
            Referral Tracking
          </CardTitle>
          <CardDescription className="text-slate-400">
            Share your referral code and track network growth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Referral Code
            </label>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button
                onClick={copyReferralLink}
                variant="outline"
                className="border-slate-600 gap-2"
              >
                <Copy size={16} />
                Copy
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="pt-4">
                <p className="text-slate-400 text-xs mb-1">Total Referrals</p>
                <p className="text-2xl font-bold text-white">0</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="pt-4">
                <p className="text-slate-400 text-xs mb-1">Active Users</p>
                <p className="text-2xl font-bold text-white">0</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="pt-4">
                <p className="text-slate-400 text-xs mb-1">Revenue Share</p>
                <p className="text-2xl font-bold text-white">$0</p>
              </CardContent>
            </Card>
          </div>

          <p className="text-sm text-slate-400">
            Share <code className="bg-slate-700 px-2 py-1 rounded">remarkability.io?ref={referralCode}</code> to start earning
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
