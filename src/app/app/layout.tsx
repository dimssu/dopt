import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { AppShell } from '@/components/AppShell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontSize: '13.5px',
          },
        }}
      />
    </AppShell>
  );
}
