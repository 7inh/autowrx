// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useEffect, useState } from 'react'
import { useLocation, Link, matchRoutes } from 'react-router-dom'
import { cn } from '@/lib/utils.ts'
import useCurrentModel from '@/hooks/useCurrentModel'
import { TbFolder, TbChevronRight, TbChevronsLeft, TbChevronsRight, TbCar, TbWorld, TbUser, TbGitMerge, TbLayoutDashboard, TbCode, TbBox, TbFile, TbPuzzle, TbSettings, TbDatabase, TbShieldLock, TbUsers, TbTemplate } from 'react-icons/tb'
import useGlobalStore from '@/stores/globalStore'

interface BreadcrumbEntry {
    path: string
    name: string
    key: string
}

const breadcrumbNames: { [key: string]: string } = {
    library: 'Prototype Library',
    prototype: 'Vehicle Prototypes',
    api: 'Vehicle API',
    architecture: 'Vehicle Architecture',
    genai: 'Vehicle App Generator',
}

const DaSidebarNav = () => {
    const { data: model } = useCurrentModel()
    const location = useLocation()
    const [entries, setEntries] = useState<BreadcrumbEntry[]>([])
    // tracks which model-list tab nodes are expanded — persisted to localStorage
    const [expandedModelTabs, setExpandedModelTabs] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('sidebar:expandedModelTabs')
            return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>()
        } catch { return new Set<string>() }
    })
    // tracks whether the model name node (depth 1) is expanded — persisted to localStorage
    const [modelNameExpanded, setModelNameExpanded] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('sidebar:modelNameExpanded')
            return saved !== null ? JSON.parse(saved) : true
        } catch { return true }
    })
    // sidebar collapsed state — persisted to localStorage
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('sidebar:isCollapsed')
            return saved !== null ? JSON.parse(saved) : false
        } catch { return false }
    })

    // Returns an icon component for a model-list tab based on its value / title
    const modelListTabIcon = (value: string, title?: string) => {
        const t = (title ?? '').toLowerCase()
        if (value === 'public' || t.includes('public')) return <TbWorld className="size-4 shrink-0" />
        if (value === 'myModel' || t.includes('my model')) return <TbCar className="size-4 shrink-0" />
        if (value === 'myContribution' || t.includes('contribut')) return <TbGitMerge className="size-4 shrink-0" />
        return <TbFolder className="size-4 shrink-0" />
    }

    // Returns an icon component for a model-detail tab based on its dataId / title
    const modelDetailTabIcon = (dataId?: string, title?: string) => {
        if (dataId === 'tab-model-overview' || title === 'Overview') return <TbLayoutDashboard className="size-4 shrink-0" />
        if (dataId === 'tab-model-api' || title === 'Vehicle API') return <TbCode className="size-4 shrink-0" />
        if (dataId === 'tab-model-library' || title === 'Prototype Library') return <TbBox className="size-4 shrink-0" />
        return <TbFile className="size-4 shrink-0" />
    }

    // Returns an icon for non-model page entries by path key
    const entryIcon = (key: string) => {
        if (key === 'profile') return <TbUser className="size-4 shrink-0" />
        if (key === 'plugins' || key === 'admin-plugins') return <TbPuzzle className="size-4 shrink-0" />
        if (key === 'schema' || key === 'instance') return <TbDatabase className="size-4 shrink-0" />
        if (key === 'privacy-policy') return <TbShieldLock className="size-4 shrink-0" />
        return <TbFolder className="size-4 shrink-0" />
    }

    const [modelListActiveTab, setModelListActiveTab, modelListTabs, modelDetailTabs] = useGlobalStore(
        (state) => [state.modelListActiveTab, state.setModelListActiveTab, state.modelListTabs, state.modelDetailTabs]
    )

    // modelListTabs / modelDetailTabs are populated by page components that may not be mounted on reload.
    // Keep a localStorage-backed cache so the sidebar tree survives a hard refresh.
    const [cachedModelListTabs, setCachedModelListTabs] = useState<typeof modelListTabs>(() => {
        try {
            const saved = localStorage.getItem('sidebar:modelListTabs')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })
    const [cachedModelDetailTabs, setCachedModelDetailTabs] = useState<typeof modelDetailTabs>(() => {
        try {
            const saved = localStorage.getItem('sidebar:modelDetailTabs')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })
    useEffect(() => {
        if (modelListTabs.length > 0) {
            setCachedModelListTabs(modelListTabs)
            localStorage.setItem('sidebar:modelListTabs', JSON.stringify(modelListTabs))
        }
    }, [modelListTabs])
    useEffect(() => {
        if (modelDetailTabs.length > 0) {
            setCachedModelDetailTabs(modelDetailTabs)
            localStorage.setItem('sidebar:modelDetailTabs', JSON.stringify(modelDetailTabs))
        }
    }, [modelDetailTabs])

    // Use live store data when available, fall back to cache
    const effectiveModelListTabs = modelListTabs.length > 0 ? modelListTabs : cachedModelListTabs
    const effectiveModelDetailTabs = modelDetailTabs.length > 0 ? modelDetailTabs : cachedModelDetailTabs

    // Persist sidebar state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sidebar:isCollapsed', JSON.stringify(isCollapsed))
    }, [isCollapsed])
    useEffect(() => {
        localStorage.setItem('sidebar:modelNameExpanded', JSON.stringify(modelNameExpanded))
    }, [modelNameExpanded])
    useEffect(() => {
        localStorage.setItem('sidebar:expandedModelTabs', JSON.stringify([...expandedModelTabs]))
    }, [expandedModelTabs])
    // Persist active model list tab so it survives reload
    useEffect(() => {
        if (modelListActiveTab) {
            localStorage.setItem('sidebar:modelListActiveTab', modelListActiveTab)
        }
    }, [modelListActiveTab])

    const pathnames = location.pathname.split('/').filter((x: string) => x)
    const isHomePage = pathnames.length === 0
    const isModelListPage = pathnames[0] === 'model' && !pathnames[1]
    const isModelDetailPage = pathnames[0] === 'model' && !!pathnames[1]

    // Restore active model list tab from localStorage on first mount
    // (kept as fallback for older browsers / cleared storage, store already initializes from localStorage)
    useEffect(() => {
        const saved = localStorage.getItem('sidebar:modelListActiveTab')
        if (saved && !modelListActiveTab) setModelListActiveTab(saved)
    }, [])

    // Auto-expand the active model list tab when navigating into a model detail page
    useEffect(() => {
        if (isModelDetailPage && modelListActiveTab) {
            setExpandedModelTabs((prev) => new Set([...prev, modelListActiveTab]))
        }
    }, [isModelDetailPage, modelListActiveTab])

    const toggleModelTab = (value: string) => {
        setExpandedModelTabs((prev) => {
            const next = new Set(prev)
            if (next.has(value)) next.delete(value)
            else next.add(value)
            return next
        })
    }

    useEffect(() => {
        const paths: BreadcrumbEntry[] = []

        if (model && pathnames[0] === 'model' && pathnames[1] === model.id) {
            paths.push({ path: `/model/${model.id}`, name: model.name, key: model.id })

            if (pathnames.includes('library') || pathnames.includes('prototype')) {
                paths.push({ path: `/model/${model.id}/library`, name: breadcrumbNames['library'], key: 'library' })
            }

            // Note: we intentionally do NOT add a separate prototype entry here
        }

        if (pathnames[0] === 'profile') {
            paths.push({ path: '/profile', name: 'My Profile', key: 'profile' })
        }
        if (pathnames[0] === 'my-assets') {
            paths.push({ path: '/my-assets', name: 'My Assets', key: 'my-assets' })
        }
        if (pathnames[0] === 'plugins') {
            paths.push({ path: '/plugins', name: 'Plugins', key: 'plugins' })
        }
        if (pathnames[0] === 'manage-users') {
            paths.push({ path: '/manage-users', name: 'Manage Users', key: 'manage-users' })
        }
        if (pathnames[0] === 'manage-features') {
            paths.push({ path: '/manage-features', name: 'Manage Features', key: 'manage-features' })
        }
        setEntries(paths)
    }, [location.pathname, model])

    if (isHomePage) return null

    // For model detail pages: entries[0] = model name, entries[1] = section path (matches the active detail tab),
    // entries.slice(2) = deeper sub-entries (e.g. a specific prototype) shown under the active detail tab
    const modelNameEntry = isModelDetailPage ? entries[0] : undefined
    const modelSubEntries = isModelDetailPage ? entries.slice(2) : []

    return (
        <nav className={cn(
            'flex flex-col shrink-0 border-r border-border h-full overflow-y-auto transition-all duration-200',
            isCollapsed ? 'w-10' : 'w-56',
        )}>
            {/* Collapse toggle button */}
            <div className="flex items-center " style={{ minHeight: '40px' }}>
                <button
                    type="button"
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    onClick={() => setIsCollapsed((v) => !v)}
                    className={cn(
                        'flex cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground transition-colors',
                        isCollapsed ? 'w-full py-2' : 'ml-auto px-3 py-2',
                    )}
                >
                    {isCollapsed
                        ? <TbChevronsRight className="size-4" />
                        : <TbChevronsLeft className="size-4" />}
                </button>
            </div>
            <ul className="flex flex-col py-1">

                {/* ── Model pages: collapsible tab tree ── */}
                {(isModelListPage || isModelDetailPage) && effectiveModelListTabs.map((tab) => {
                    const isTabActive = modelListActiveTab === tab.value
                    const isExpanded = expandedModelTabs.has(tab.value)
                    const showChildren = isExpanded && isModelDetailPage && isTabActive && !!modelNameEntry

                    return (
                        <React.Fragment key={tab.value}>
                            {/* Tab header: chevron toggles collapse, label navigates to /model */}
                            <li
                                title={isCollapsed ? tab.title : undefined}
                                className={cn(
                                    'flex items-center text-sm transition-colors hover:bg-muted',
                                    isTabActive && 'bg-primary/10 text-primary font-semibold',
                                )}
                            >
                                {isCollapsed ? (
                                    /* Collapsed: single icon button navigates + sets active tab */
                                    <Link
                                        to="/model"
                                        onClick={() => setModelListActiveTab(tab.value)}
                                        className="flex w-full items-center justify-center py-2"
                                    >
                                        {modelListTabIcon(tab.value, tab.title)}
                                    </Link>
                                ) : (
                                    <>
                                        {/* Chevron — toggle collapse only */}
                                        <button
                                            type="button"
                                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                            onClick={() => toggleModelTab(tab.value)}
                                            className="flex items-center justify-center pl-3 pr-1 py-2 shrink-0 hover:text-primary"
                                        >
                                            <TbChevronRight className={cn(
                                                'size-3.5 text-muted-foreground transition-transform duration-150',
                                                isExpanded && 'rotate-90',
                                            )} />
                                        </button>
                                        {/* Label — navigate to /model and set active tab */}
                                        <Link
                                            to="/model"
                                            onClick={() => setModelListActiveTab(tab.value)}
                                            className="flex flex-1 items-center justify-between py-2 pr-3 min-w-0"
                                        >
                                            <span className="flex items-center gap-1.5 min-w-0">
                                                {modelListTabIcon(tab.value, tab.title)}
                                                <span className="truncate">{tab.title}</span>
                                            </span>
                                            <span className="flex min-w-5 px-1.5 py-0.5 items-center justify-center text-xs bg-gray-200 rounded-md ml-1.5 shrink-0">
                                                {tab.count}
                                            </span>
                                        </Link>
                                    </>
                                )}
                            </li>

                            {showChildren && !isCollapsed && (
                                <>
                                    {/* Model name — depth 1, collapsible */}
                                    <li
                                        className={cn(
                                            'flex items-center text-sm font-medium transition-colors hover:bg-muted',
                                            (location.pathname === modelNameEntry.path || isModelDetailPage) && 'bg-primary/10 text-primary font-semibold',
                                        )}
                                    >
                                        {/* Chevron — only if there are detail tabs */}
                                        {effectiveModelDetailTabs.length > 0 ? (
                                            <button
                                                type="button"
                                                aria-label={modelNameExpanded ? 'Collapse' : 'Expand'}
                                                onClick={() => setModelNameExpanded((v) => !v)}
                                                className="flex items-center justify-center shrink-0 hover:text-primary"
                                                style={{ paddingLeft: `${12 + 16}px`, paddingRight: '4px', paddingTop: '8px', paddingBottom: '8px' }}
                                            >
                                                <TbChevronRight className={cn(
                                                    'size-3.5 text-muted-foreground transition-transform duration-150',
                                                    modelNameExpanded && 'rotate-90',
                                                )} />
                                            </button>
                                        ) : (
                                            <span style={{ paddingLeft: `${12 + 16}px` }} />
                                        )}
                                        {/* Label — navigate to model overview */}
                                        <Link
                                            to={modelNameEntry.path}
                                            className="flex flex-1 items-center gap-1.5 py-2 pr-3 min-w-0"
                                        >
                                            <TbCar className="size-4 shrink-0" />
                                            <span className="truncate">{modelNameEntry.name}</span>
                                        </Link>
                                    </li>

                                    {/* Model detail tabs — depth 2 */}
                                    {modelNameExpanded && effectiveModelDetailTabs.map((detailTab, i) => {
                                        const isDetailActive = detailTab.pluginSlug
                                            ? location.pathname.includes('/plugin') && location.search.includes(`plugid=${detailTab.pluginSlug}`)
                                            : !!matchRoutes(
                                                detailTab.subs.map((s) => ({ path: s })),
                                                location.pathname,
                                            )?.at(0)
                                        const subEntries = isDetailActive ? modelSubEntries : []
                                        return (
                                            <React.Fragment key={i}>
                                                <li>
                                                    <Link
                                                        to={detailTab.to}
                                                        className={cn(
                                                            'flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-muted',
                                                            isDetailActive && 'bg-primary/10 text-primary font-semibold',
                                                        )}
                                                        style={{ paddingLeft: `${12 + 2 * 16}px` }}
                                                    >
                                                        <span className="flex items-center gap-1.5 min-w-0">
                                                            {subEntries.length > 0 && (
                                                                <TbChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                                                            )}
                                                            {modelDetailTabIcon(detailTab.dataId, detailTab.title)}
                                                            <span className="truncate">{detailTab.title}</span>
                                                        </span>
                                                        {detailTab.count !== null && (
                                                            <span className="flex min-w-5 px-1.5 py-0.5 items-center justify-center text-xs bg-gray-200 rounded-md">
                                                                {detailTab.count}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </li>
                                                {/* Deeper sub-entries (Library, Prototype) — depth 3+ */}
                                                {subEntries.map((sub, subIndex) => {
                                                    const isSubActive = location.pathname === sub.path
                                                    const isSubLast = subIndex === subEntries.length - 1
                                                    return (
                                                        <li key={sub.key}>
                                                            <Link
                                                                to={sub.path}
                                                                className={cn(
                                                                    'flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted',
                                                                    isSubActive && 'bg-primary/10 text-primary font-semibold',
                                                                    isSubLast && !isSubActive && 'font-medium',
                                                                )}
                                                                style={{ paddingLeft: `${12 + (3 + subIndex) * 16}px` }}
                                                            >
                                                                <TbChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                                                                <TbFolder className="size-4 shrink-0" />
                                                                <span className="truncate">{sub.name}</span>
                                                            </Link>
                                                        </li>
                                                    )
                                                })}
                                            </React.Fragment>
                                        )
                                    })}
                                </>
                            )}
                        </React.Fragment>
                    )
                })}

                {/* ── Non-model pages: flat tree from entries ── */}
                {!isModelListPage && !isModelDetailPage && entries.map((entry, index) => {
                    const isActive = location.pathname === entry.path
                    const isLast = index === entries.length - 1
                    return (
                        <li key={entry.key} title={isCollapsed ? entry.name : undefined}>
                            <Link
                                to={entry.path}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted',
                                    isActive && 'bg-primary/10 text-primary font-semibold',
                                    isLast && !isActive && 'font-medium',
                                    isCollapsed && 'justify-center px-0',
                                )}
                                style={isCollapsed ? undefined : { paddingLeft: `${12 + index * 16}px` }}
                            >
                                {!isCollapsed && index > 0 && (
                                    <TbChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                                )}
                                {entryIcon(entry.key)}
                                {!isCollapsed && <span className="truncate">{entry.name}</span>}
                            </Link>
                        </li>
                    )
                })}

            </ul>
        </nav>
    )
}

export default DaSidebarNav
