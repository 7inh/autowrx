// Copyright (c) 2025-2026 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listProjectTemplates,
  deleteProjectTemplate,
  type ProjectTemplate,
  type ApiMutationError,
} from '@/services/projectTemplate.service'
import { Button } from '@/components/atoms/button'
import ProjectTemplateEditor from '@/components/molecules/ProjectTemplateEditor'
import DaConfirmPopup from '@/components/molecules/DaConfirmPopup'
import { PROJECT_TEMPLATE_QUERY_LIMIT } from '@/hooks/useProjectTemplateOptions'
import { TbPencil, TbTrash, TbCode } from 'react-icons/tb'
import { Spinner } from '@/components/atoms/spinner'
import { toast } from 'react-toastify'
import usePermissionHook from '@/hooks/usePermissionHook'
import { PERMISSIONS } from '@/data/permission'

export default function ProjectTemplateManager() {
  const qc = useQueryClient()
  const [openForm, setOpenForm] = useState(false)
  const [editId, setEditId] = useState<string | undefined>(undefined)
  const [isAdmin] = usePermissionHook([PERMISSIONS.MANAGE_USERS])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['project-templates'],
    queryFn: () => listProjectTemplates({ limit: PROJECT_TEMPLATE_QUERY_LIMIT, page: 1 }),
  })

  const del = useMutation({
    mutationFn: (id: string) => deleteProjectTemplate(id),
    onSuccess: () => {
      toast.success('Deleted')
      qc.invalidateQueries({ queryKey: ['project-templates'] })
    },
    onError: (e: ApiMutationError) =>
      toast.error(e?.response?.data?.message || e.message || 'Delete failed'),
  })

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Project Templates</h1>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditId(undefined)
              setOpenForm(true)
            }}
          >
            New Template
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-6" />
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-sm text-destructive">
            Failed to load project templates. Please try again later.
          </p>
        </div>
      )}

      {!isLoading && !isError && (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data?.results?.map((t: ProjectTemplate) => (
          <div
            key={t.id}
            className={`rounded-md border border-input bg-background p-3 shadow-sm flex flex-col transition ${isAdmin ? 'cursor-pointer hover:shadow-md' : ''}`}
            onClick={() => {
              if (!isAdmin) return
              setEditId(t.id)
              setOpenForm(true)
            }}
          >
            <div className="relative aspect-video w-full rounded overflow-hidden bg-muted flex items-center justify-center">
              <TbCode className="size-10 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <h3 className="text-base font-semibold text-foreground truncate">
                {t.name}
              </h3>
              {t.is_default && (
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded px-1.5 py-0.5">
                  Default
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {t.language}
              </span>
            </div>
            {t.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {t.description}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  t.visibility === 'public'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t.visibility}
              </span>
              {isAdmin && (
                <div className="flex gap-1">
                  <Button
                    title="Edit"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditId(t.id)
                      setOpenForm(true)
                    }}
                  >
                    <TbPencil className="text-base" />
                  </Button>
                  <DaConfirmPopup
                    label="Are you sure you want to delete this project template?"
                    title="Delete Template"
                    onConfirm={() => del.mutate(t.id)}
                  >
                    <Button
                      title="Delete"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TbTrash className="text-base" />
                    </Button>
                  </DaConfirmPopup>
                </div>
              )}
            </div>
          </div>
        ))}
        {!data?.results?.length && (
          <div className="col-span-full text-center py-12">
            <TbCode className="size-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No project templates yet
            </p>
          </div>
        )}
      </div>
      )}

      <ProjectTemplateEditor
        open={openForm}
        onOpenChange={(v) => {
          setOpenForm(v)
          if (!v) setEditId(undefined)
        }}
        editId={editId}
      />
    </div>
  )
}
