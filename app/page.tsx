'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/spinner';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }

    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
