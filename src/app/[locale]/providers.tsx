'use client'

import { Toaster } from '@/components/ui/toaster'

export const Providers = ({ children }: { children?: React.ReactNode }) => {
    return (
        <>
            {children}
            <Toaster />
        </>
    )
}