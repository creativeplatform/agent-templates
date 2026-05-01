import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StrategicInputs {
  audience: string
  tension: string
  purpleCow: string
  sources: string
  newsletter: string
}

interface Asset {
  id: string
  type: 'headline' | 'social_riff' | 'visual_brief'
  content: string
  createdAt: Date
}

interface RemarkabilityStore {
  // Zone 1 State
  strategicInputs: StrategicInputs
  updateStrategicInputs: (inputs: Partial<StrategicInputs>) => void

  // Zone 2 State
  assets: Asset[]
  addAsset: (asset: Asset) => void
  removeAsset: (id: string) => void

  // Zone 3 State
  sponsorSlots: Array<{ id: string; name: string }>
  updateSponsorSlots: (slots: Array<{ id: string; name: string }>) => void
  referralCode: string
  updateReferralCode: (code: string) => void

  // UI State
  currentZone: string
  setCurrentZone: (zone: string) => void
}

export const useRemarkability = create<RemarkabilityStore>()(
  persist(
    (set) => ({
      // Zone 1
      strategicInputs: {
        audience: '',
        tension: '',
        purpleCow: '',
        sources: '',
        newsletter: '',
      },
      updateStrategicInputs: (inputs) =>
        set((state) => ({
          strategicInputs: { ...state.strategicInputs, ...inputs },
        })),

      // Zone 2
      assets: [],
      addAsset: (asset) =>
        set((state) => ({
          assets: [...state.assets, asset],
        })),
      removeAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        })),

      // Zone 3
      sponsorSlots: [
        { id: '1', name: 'Sponsor Slot 1' },
        { id: '2', name: 'Sponsor Slot 2' },
        { id: '3', name: 'Sponsor Slot 3' },
      ],
      updateSponsorSlots: (slots) =>
        set({ sponsorSlots: slots }),
      referralCode: 'REMARK2024',
      updateReferralCode: (code) =>
        set({ referralCode: code }),

      // UI
      currentZone: 'zone1',
      setCurrentZone: (zone) =>
        set({ currentZone: zone }),
    }),
    {
      name: 'remarkability-storage',
      version: 1,
    }
  )
)
