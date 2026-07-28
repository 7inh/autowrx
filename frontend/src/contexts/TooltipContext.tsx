// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { createContext, useContext, useState, ReactNode } from 'react'

interface TooltipContextType {
  activeTooltip: string | null
  setActiveTooltip: (id: string | null) => void
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined)

export const TooltipProvider = ({ children }: { children: ReactNode }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  return (
    <TooltipContext.Provider value={{ activeTooltip, setActiveTooltip }}>
      {children}
    </TooltipContext.Provider>
  )
}

export const useGlobalTooltip = (tooltipId: string) => {
  const context = useContext(TooltipContext)
  if (!context) {
    throw new Error('useGlobalTooltip must be used within TooltipProvider')
  }

  const isOpen = context.activeTooltip === tooltipId
  const setOpen = (open: boolean) => {
    context.setActiveTooltip(open ? tooltipId : null)
  }

  return { isOpen, setOpen }
}
