// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { mountStoreDevtool } from 'simple-zustand-devtools'
import { immer } from 'zustand/middleware/immer'
import { createWithEqualityFn } from 'zustand/traditional'

export type NavLayout = 'horizontal' | 'sidebar'

export interface ModelListTab {
  title: string
  value: string
  count: number
}

export interface ModelDetailTab {
  title: string
  to: string
  subs: string[]
  count: number | null
  dataId?: string
  pluginSlug?: string // set for custom plugin tabs
}

type GlobalState = {
  isChatShowed?: boolean
  isShowedAutomationControl?: boolean
  automationSequence?: any
  navLayout: NavLayout
  modelListActiveTab: string
  modelListTabs: ModelListTab[]
  modelDetailTabs: ModelDetailTab[]
}

type Actions = {
  setIsChatShowed: (value: boolean) => void
  setIsShowedAutomationControl?: (value: boolean) => void
  setAutomationSequence?: (sequence: any) => void
  setAutomationSequenceActionAt?: (index: number, action: any) => void
  setNavLayout: (layout: NavLayout) => void
  setModelListActiveTab: (tab: string) => void
  setModelListTabs: (tabs: ModelListTab[]) => void
  setModelDetailTabs: (tabs: ModelDetailTab[]) => void
}

const getInitialNavLayout = (): NavLayout => {
  try {
    const stored = localStorage.getItem('navLayout')
    if (stored === 'horizontal' || stored === 'sidebar') return stored
  } catch {}
  return 'horizontal'
}

function getInitialModelListActiveTab(): string {
  try {
    const saved = localStorage.getItem('sidebar:modelListActiveTab')
    if (saved) return saved
  } catch {}
  return 'public'
}

const useGlobalStore = createWithEqualityFn<GlobalState & Actions>()(
  immer((set) => ({
    isChatShowed: false,
    isShowedAutomationControl: false,
    automationSequence: null,
    navLayout: getInitialNavLayout(),
    modelListActiveTab: getInitialModelListActiveTab(),
    modelListTabs: [],
    modelDetailTabs: [],
    setIsChatShowed: (value) =>
      set((state) => {
        state.isChatShowed = value
      }),
    setIsShowedAutomationControl: (value) =>
      set((state) => {
        state.isShowedAutomationControl = value
      }),
    setNavLayout: (layout) =>
      set((state) => {
        state.navLayout = layout
        try {
          localStorage.setItem('navLayout', layout)
        } catch {}
      }),
    setModelListActiveTab: (tab) =>
      set((state) => {
        state.modelListActiveTab = tab
      }),
    setModelListTabs: (tabs) =>
      set((state) => {
        state.modelListTabs = tabs
      }),
    setModelDetailTabs: (tabs) =>
      set((state) => {
        state.modelDetailTabs = tabs
      }),
    setAutomationSequence: (sequence) =>
      set((state) => {
        const newSequence = {...sequence}
        newSequence.lastUpdated = new Date()
        state.automationSequence = newSequence
      }),
    setAutomationSequenceActionAt: (index, action) => {
      // console.log('setAutomationSequenceActionAt', index, action)
      set((state) => {
        if (state.automationSequence && state.automationSequence.actions.length > index) {
          // Create a new array to trigger reactivity
          const newSequence = {...state.automationSequence}
          newSequence.actions[index] = action
          newSequence.lastUpdated = new Date()
          state.automationSequence = newSequence
        }
      })
    }
  })),
)

if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('GlobalStore', useGlobalStore)
}

export default useGlobalStore
