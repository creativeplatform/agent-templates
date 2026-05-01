import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NewsletterState {
  // Zone 1: Strategic Inputs
  audience: string;
  tension: string;
  purpleCow: string;
  sources: string[];
  markdownContent: string;

  // Zone 2: Assets
  generatedAssets: Array<{
    id: string;
    type: 'image' | 'riff';
    title: string;
    content: string;
    timestamp: number;
  }>;

  // Zone 3: Monetization
  selectedSponsor: string | null;
  sponsorSlotResult: string | null;
  emailDistributionEmail: string;
  paragraphApiKey: string;

  // Actions
  updateAudience: (audience: string) => void;
  updateTension: (tension: string) => void;
  updatePurpleCow: (purpleCow: string) => void;
  addSource: (source: string) => void;
  removeSource: (index: number) => void;
  setSources: (sources: string[]) => void;
  updateMarkdown: (content: string) => void;
  addAsset: (asset: Omit<(typeof store.getState)['generatedAssets'][0], 'id' | 'timestamp'>) => void;
  removeAsset: (id: string) => void;
  setSponsor: (sponsor: string) => void;
  setSlotResult: (result: string) => void;
  setEmailDistribution: (email: string) => void;
  setParagraphApiKey: (key: string) => void;
  reset: () => void;
}

const initialState = {
  audience: '',
  tension: '',
  purpleCow: '',
  sources: [],
  markdownContent: '# Your Newsletter Title\n\nStart crafting your remarkable content here.',
  generatedAssets: [],
  selectedSponsor: null,
  sponsorSlotResult: null,
  emailDistributionEmail: '',
  paragraphApiKey: '',
};

const store = create<NewsletterState>()(
  persist(
    (set) => ({
      ...initialState,

      updateAudience: (audience) => set({ audience }),
      updateTension: (tension) => set({ tension }),
      updatePurpleCow: (purpleCow) => set({ purpleCow }),

      addSource: (source) =>
        set((state) => ({
          sources: [...state.sources, source],
        })),

      removeSource: (index) =>
        set((state) => ({
          sources: state.sources.filter((_, i) => i !== index),
        })),

      setSources: (sources) => set({ sources }),

      updateMarkdown: (content) => set({ markdownContent: content }),

      addAsset: (asset) =>
        set((state) => ({
          generatedAssets: [
            ...state.generatedAssets,
            {
              ...asset,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),

      removeAsset: (id) =>
        set((state) => ({
          generatedAssets: state.generatedAssets.filter((asset) => asset.id !== id),
        })),

      setSponsor: (sponsor) => set({ selectedSponsor: sponsor }),
      setSlotResult: (result) => set({ sponsorSlotResult: result }),
      setEmailDistribution: (email) => set({ emailDistributionEmail: email }),
      setParagraphApiKey: (key) => set({ paragraphApiKey: key }),

      reset: () => set(initialState),
    }),
    {
      name: 'remarkability-engine-store',
      version: 1,
    }
  )
);

export const useStore = store;
