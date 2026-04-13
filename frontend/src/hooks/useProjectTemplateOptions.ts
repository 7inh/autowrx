// Copyright (c) 2025-2026 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listProjectTemplates, type ProjectTemplate } from '@/services/projectTemplate.service'
import { SAMPLE_PROJECTS } from '@/data/sampleProjects'

export const PROJECT_TEMPLATE_QUERY_LIMIT = 500

export interface TemplateOption {
  value: string
  label: string
  language: string
  code: string | unknown[]
  source: 'server' | 'builtin'
}

export function useProjectTemplateOptions() {
  const { data: projectTemplatesData } = useQuery({
    queryKey: ['project-templates'],
    queryFn: () => listProjectTemplates({ limit: PROJECT_TEMPLATE_QUERY_LIMIT, page: 1 }),
    staleTime: 5 * 60 * 1000,
  })

  const templateOptions = useMemo<TemplateOption[]>(() => {
    const serverTemplates: TemplateOption[] = (projectTemplatesData?.results ?? []).map((t: ProjectTemplate) => ({
      value: `server:${t.id}`,
      label: t.name,
      language: t.language,
      code: t.code,
      source: 'server' as const,
    }))
    const builtinTemplates: TemplateOption[] = SAMPLE_PROJECTS.map((p) => ({
      value: `builtin:${p.label}`,
      label: p.label,
      language: p.language,
      code: p.data,
      source: 'builtin' as const,
    }))
    return [...serverTemplates, ...builtinTemplates]
  }, [projectTemplatesData])

  const defaultTemplate = useMemo(() => {
    const serverDefault = projectTemplatesData?.results?.find((t: ProjectTemplate) => t.is_default)
    if (serverDefault) {
      return templateOptions.find((o) => o.value === `server:${serverDefault.id}`)
    }
    return templateOptions[0] ?? null
  }, [projectTemplatesData, templateOptions])

  const [selectedValue, setSelectedValue] = useState<string>('')
  const initializedRef = useRef(false)

  useEffect(() => {
    if (defaultTemplate && !initializedRef.current) {
      initializedRef.current = true
      setSelectedValue(defaultTemplate.value)
    }
  }, [defaultTemplate])

  const selectedTemplate = useMemo(
    () => templateOptions.find((t) => t.value === selectedValue) ?? defaultTemplate,
    [templateOptions, selectedValue, defaultTemplate],
  )

  const resolvedLanguage = selectedTemplate?.language ?? SAMPLE_PROJECTS[0]?.language ?? 'python'
  const resolvedCode = useMemo(() => {
    if (!selectedTemplate) {
      const fallback = SAMPLE_PROJECTS[0]?.data
      return typeof fallback === 'string' ? fallback : JSON.stringify(fallback ?? '')
    }
    return typeof selectedTemplate.code === 'string'
      ? selectedTemplate.code
      : JSON.stringify(selectedTemplate.code)
  }, [selectedTemplate])

  const onTemplateChange = useCallback((v: string) => {
    if (templateOptions.find((t) => t.value === v)) {
      setSelectedValue(v)
    }
  }, [templateOptions])

  return {
    templateOptions,
    defaultTemplate,
    selectedValue,
    selectedTemplate,
    resolvedLanguage,
    resolvedCode,
    onTemplateChange,
  }
}
