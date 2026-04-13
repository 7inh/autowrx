// Copyright (c) 2025-2026 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProjectTemplateById,
  createProjectTemplate,
  updateProjectTemplate,
  type ApiMutationError,
} from '@/services/projectTemplate.service'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Textarea } from '@/components/atoms/textarea'
import { Label } from '@/components/atoms/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import DaDialog from '@/components/molecules/DaDialog'
import Editor from '@monaco-editor/react'
import { Spinner } from '@/components/atoms/spinner'
import { toast } from 'react-toastify'
import { SUPPORTED_LANGUAGES } from '@/const/languages'

interface FormState {
  name: string
  description: string
  language: string
  visibility: 'public' | 'private'
  is_default: boolean
}

const emptyForm: FormState = {
  name: '',
  description: '',
  language: 'python',
  visibility: 'public',
  is_default: false,
}

export interface ProjectTemplateEditorProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  editId?: string
  onSuccess?: () => void
  initialCode?: string
  initialLanguage?: string
}

export default function ProjectTemplateEditor({
  open,
  onOpenChange,
  editId,
  onSuccess,
  initialCode,
  initialLanguage,
}: ProjectTemplateEditorProps) {
  const qc = useQueryClient()
  const isEdit = !!editId
  const [form, setForm] = useState<FormState>(emptyForm)
  const [code, setCode] = useState<string>('')

  const { data: editData } = useQuery({
    queryKey: ['project-template-edit', editId],
    queryFn: () => getProjectTemplateById(editId!),
    enabled: isEdit && open,
    staleTime: 0,
  })

  useEffect(() => {
    if (!open) return
    if (isEdit && editData) {
      setForm({
        name: editData.name || '',
        description: editData.description || '',
        language: editData.language || 'python',
        visibility: (editData.visibility as FormState['visibility']) ?? 'public',
        is_default: editData.is_default ?? false,
      })
      setCode(
        typeof editData.code === 'string'
          ? editData.code
          : JSON.stringify(editData.code, null, 2),
      )
    } else if (!isEdit) {
      setForm({
        ...emptyForm,
        language: initialLanguage || 'python',
      })
      setCode(initialCode || '')
    }
  }, [open, isEdit, editData, initialCode, initialLanguage])

  const save = useMutation({
    mutationFn: async () => {
      // Multi-file templates (e.g. Rust) are stored as FileSystemItem[]; promote
      // JSON arrays back to structured data so Mongo stores them as arrays, not strings.
      let codeValue: string | unknown[] = code
      try {
        const parsed = JSON.parse(code)
        if (Array.isArray(parsed)) {
          codeValue = parsed
        }
      } catch {
        // plain text code — keep as string
      }
      const payload = {
        name: form.name,
        description: form.description,
        language: form.language,
        code: codeValue,
        visibility: form.visibility,
        is_default: form.is_default,
      }
      if (isEdit) return updateProjectTemplate(editId!, payload)
      return createProjectTemplate(payload)
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Project template updated' : 'Project template created')
      qc.invalidateQueries({ queryKey: ['project-templates'] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (e: ApiMutationError) =>
      toast.error(e?.response?.data?.message || e.message || 'Save failed'),
  })

  return (
    <DaDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setForm({ ...emptyForm })
          setCode('')
        }
        onOpenChange(v)
      }}
      className="w-[95vw] sm:w-[90vw] max-w-[1200px] h-[90vh] max-h-[calc(100dvh-2rem)]"
    >
      <div className="flex flex-col h-full p-4 sm:p-6 gap-4 overflow-hidden">
        <h2 className="text-lg font-semibold shrink-0">
          {isEdit ? 'Edit Project Template' : 'New Project Template'}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="flex-1 space-y-2">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Template name"
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Short description"
              rows={1}
            />
          </div>
          <div className="w-40 space-y-2">
            <Label>Language *</Label>
            <Select
              value={form.language}
              onValueChange={(v) => setForm((f) => ({ ...f, language: v }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36 space-y-2">
            <Label>Visibility</Label>
            <Select
              value={form.visibility}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, visibility: v as FormState['visibility'] }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="checkbox"
            id="is-default-project-template"
            checked={form.is_default}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_default: e.target.checked }))
            }
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="is-default-project-template" className="cursor-pointer text-sm">
            Set as default template
          </Label>
          <span className="text-xs text-muted-foreground">
            (used as initial code when creating a new prototype)
          </span>
        </div>

        <div className="flex flex-col flex-1 min-h-0 space-y-2">
          <Label className="shrink-0">Code *</Label>
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
            <Editor
              value={code}
              language={form.language}
              onChange={(v) => setCode(v || '')}
              height="100%"
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                fontSize: 13,
              }}
              loading={
                <div className="flex items-center justify-center h-full">
                  <Spinner />
                </div>
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              setForm({ ...emptyForm })
              setCode('')
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={!form.name.trim() || !code.trim() || save.isPending}
          >
            {save.isPending ? 'Saving\u2026' : isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </DaDialog>
  )
}
