// Copyright (c) 2025-2026 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { serverAxios } from '@/services/base'
import { List, ListQueryParams } from '@/types/common.type'

export interface ProjectTemplate {
  id: string
  name: string
  description?: string
  language: string
  code: string | unknown[]
  visibility: 'public' | 'private'
  is_default?: boolean
  created_at?: string
  created_by?: string
  updated_by?: string
}

export type ApiMutationError = Error & {
  response?: { data?: { message?: string } }
}

export interface ListProjectTemplateParams extends ListQueryParams {
  name?: string
  language?: string
  visibility?: 'public' | 'private'
  is_default?: boolean
}

export const listProjectTemplates = (
  params?: ListProjectTemplateParams,
): Promise<List<ProjectTemplate>> =>
  serverAxios.get('/system/project-template', { params }).then((r) => r.data)

export const getProjectTemplateById = (
  id: string,
): Promise<ProjectTemplate> =>
  serverAxios.get(`/system/project-template/${id}`).then((r) => r.data)

export const createProjectTemplate = (
  data: Partial<ProjectTemplate>,
): Promise<ProjectTemplate> =>
  serverAxios.post('/system/project-template', data).then((r) => r.data)

export const updateProjectTemplate = (
  id: string,
  data: Partial<ProjectTemplate>,
): Promise<ProjectTemplate> =>
  serverAxios.put(`/system/project-template/${id}`, data).then((r) => r.data)

export const deleteProjectTemplate = (id: string): Promise<void> =>
  serverAxios.delete(`/system/project-template/${id}`).then(() => undefined)
