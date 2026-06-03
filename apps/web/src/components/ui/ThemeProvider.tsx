'use client'

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

// next-themes v0.4 ThemeProviderProps doesn't include children in its React 19
// type definitions. Cast to add it back so JSX children pass type-checking.
const Provider = NextThemesProvider as React.ComponentType<ThemeProviderProps & { children?: React.ReactNode }>

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      attribute="data-theme"
      defaultTheme="pulse"
      themes={['pulse', 'terra', 'comic', 'modern', 'editorial', 'sage', 'slate']}
      disableTransitionOnChange
    >
      {children}
    </Provider>
  )
}
