import * as React from 'react'
import type { UniwindContext } from '../src/core/context'

export const TW_RED_500 = '#fb2c36'
export const TW_GREEN_500 = '#00c950'
export const TW_BLUE_500 = '#2b7fff'
export const TW_YELLOW_500 = '#f0b100'
export const TW_SPACING = 4

export const SAFE_AREA_INSET_TOP = 21
export const SAFE_AREA_INSET_BOTTOM = 42

export const SCREEN_WIDTH = 390
export const SCREEN_HEIGHT = 844

export const UNIWIND_CONTEXT_MOCK = {
    scopedTheme: null,
} satisfies React.ContextType<typeof UniwindContext>
