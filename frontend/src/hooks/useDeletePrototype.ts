// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePrototypeService } from '@/services/prototype.service'
import { prototypeQueryKeys } from '@/hooks/prototypeQueryKeys'

const useDeletePrototype = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (prototypeId: string) => deletePrototypeService(prototypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prototypeQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['listModelPrototypes'] })
      queryClient.invalidateQueries({ queryKey: prototypeQueryKeys.recent() })
      queryClient.invalidateQueries({ queryKey: prototypeQueryKeys.popular() })
    },
  })
}

export default useDeletePrototype
