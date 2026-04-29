'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BarChart, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      {/* Left Sidebar */}
      <Sidebar>
        <SidebarContent>
          <SidebarGroup className='py-18'>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/dashboard'}
                  >
                    <Link href='/dashboard'>
                      <BarChart />
                      <span>Analyze</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/history'}>
                    <Link href='/history'>
                      <History />
                      <span>History</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className='relative'>
        {/* Header */}
        <header className='fixed top-0 left-0 right-0 z-10 border-b border-border bg-card h-16'>
          <div className='mx-auto flex w-full h-full items-center px-4 sm:px-6 lg:px-8 gap-2'>
            <SidebarTrigger className='-ml-4' />
            <div className='flex flex-1 items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-foreground'>
                  AI Ads Optimizer
                </h1>
              </div>

              <div className='flex items-center gap-2 z-20'>

                <Button onClick={handleLogout} variant='outline'>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className='pt-16'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
