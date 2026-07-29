// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { useQuery } from '@tanstack/react-query'
import { listPopularPrototypes } from '@/services/prototype.service'
import { prototypeQueryKeys } from '@/hooks/prototypeQueryKeys'

const usePopularPrototypes = (enabled = true) => {
  return useQuery({
    queryKey: prototypeQueryKeys.popular(),
    queryFn: listPopularPrototypes,
    enabled,
  })
}

export default usePopularPrototypes
