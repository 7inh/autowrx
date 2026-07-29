// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSelfProfileQuery from '@/hooks/useSelfProfile'
import useRecentPrototypes from '@/hooks/useRecentPrototypes'
import { TbChevronDown, TbChevronRight } from 'react-icons/tb'
import { Button } from '../atoms/button'
import { DaPrototypeCard, DaPrototypeCardSkeleton } from '../molecules/DaPrototypeCard'

type HomePrototypeRecentProps = {
  title?: string
}

const HomePrototypeRecent = ({ title }: HomePrototypeRecentProps) => {
  const { data: user } = useSelfProfileQuery()
  const { data: recentPrototypes, isLoading } = useRecentPrototypes(!!user)
  const [showMore, setShowMore] = useState(false)
  const navigate = useNavigate()

  if (recentPrototypes && recentPrototypes.length === 0) {
    return null
  }

  return (
    user && (
      <div className="flex flex-col w-full container">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            {title || 'Recent Prototypes'}
          </h2>
          {recentPrototypes && recentPrototypes.length > 4 && (
            <div className="flex justify-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMore(!showMore)}
                className="flex items-center text-primary"
              >
                {showMore ? (
                  <>
                    Show Less
                    <TbChevronRight className="ml-1" />
                  </>
                ) : (
                  <>
                    Show More
                    <TbChevronDown className="ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {recentPrototypes ? (
          <div className="mt-2 w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {recentPrototypes
              .slice(0, showMore ? recentPrototypes.length : 4)
              .map((prototype) => (
                <div
                  key={prototype.id}
                  onClick={() =>
                    navigate(
                      `/model/${prototype.model_id}/library/prototype/${prototype.id}/view`,
                    )
                  }
                  className="cursor-pointer"
                >
                  <DaPrototypeCard prototype={prototype} variant="home" />
                </div>
              ))}
          </div>
        ) : (
          <div className="mt-2 w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <DaPrototypeCardSkeleton key={i} />
              ))}
          </div>
        )}
      </div>
    )
  )
}

export default HomePrototypeRecent
