// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

export const prototypeQueryKeys = {
  all: ['prototypes'] as const,
  paged: (params: Record<string, unknown>) =>
    ['prototypes', 'paged', params] as const,
  model: (modelId: string) => ['listModelPrototypes', modelId] as const,
  recent: () => ['prototypes', 'recent'] as const,
  popular: () => ['prototypes', 'popular'] as const,
}
