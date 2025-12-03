/**
 * Stack Auth Provider Component
 *
 * This component provides Stack Auth context to the application.
 * Wrap your app with this provider to enable Stack Auth functionality.
 *
 * NOTE: This component will need to be updated once the correct Stack Auth package is installed.
 */

'use client';

// TODO: Update import once correct package is installed
// import { StackProvider } from '@stackframejs/nextjs';
import { ReactNode } from 'react';

interface StackAuthProviderProps {
  children: ReactNode;
}

export function StackAuthProvider({ children }: StackAuthProviderProps) {
  // TODO: Uncomment once package is installed
  // return (
  //   <StackProvider>
  //     {children}
  //   </StackProvider>
  // );

  // Placeholder - just return children for now
  return <>{children}</>;
}
