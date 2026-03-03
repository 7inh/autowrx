// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React from 'react'
import { TbLayoutNavbar, TbLayoutSidebar } from 'react-icons/tb'

export type NavLayout = 'horizontal' | 'sidebar'

interface NavLayoutOption {
    value: NavLayout
    label: string
    description: string
    icon: React.ReactNode
}

const NAV_LAYOUT_OPTIONS: NavLayoutOption[] = [
    {
        value: 'horizontal',
        label: 'Horizontal',
        description: 'Navigation items displayed in the top bar',
        icon: <TbLayoutNavbar className="size-6" />,
    },
    {
        value: 'sidebar',
        label: 'Sidebar',
        description: 'Navigation items displayed in a collapsible left sidebar',
        icon: <TbLayoutSidebar className="size-6" />,
    },
]

interface NavLayoutEditorProps {
    value: NavLayout
    onChange: (layout: NavLayout) => void
}

const NavLayoutEditor: React.FC<NavLayoutEditorProps> = ({ value, onChange }) => {
    return (
        <div className="flex gap-4">
            {NAV_LAYOUT_OPTIONS.map((option) => {
                const isSelected = value === option.value
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`flex-1 flex items-center gap-4 px-4 py-4 rounded-lg border-2 text-left transition-colors ${isSelected
                                ? 'border-primary bg-primary/5 text-foreground'
                                : 'border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <span className={isSelected ? 'text-primary' : 'text-muted-foreground'}>
                            {option.icon}
                        </span>
                        <span>
                            <span className="block text-sm font-semibold">{option.label}</span>
                            <span className="block text-xs mt-0.5">{option.description}</span>
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

export default NavLayoutEditor
