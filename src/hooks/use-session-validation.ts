'use client';

import { validateClientSession } from '@/lib/auth/session-validation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface SessionValidationState {
  isValid: boolean;
  isLoading: boolean;
  error?: string;
  shouldRefresh: boolean;
}

export function useSessionValidation() {
  const { data: session, status } = useSession();
  const [validationState, setValidationState] =
    useState<SessionValidationState>({
      isValid: false,
      isLoading: true,
      shouldRefresh: false,
    });

  useEffect(() => {
    const validateSession = async () => {
      if (status === 'loading') {
        setValidationState(prev => ({ ...prev, isLoading: true }));
        return;
      }

      if (status === 'unauthenticated') {
        setValidationState({
          isValid: false,
          isLoading: false,
          error: 'Not authenticated',
          shouldRefresh: false,
        });
        return;
      }

      if (session) {
        setValidationState(prev => ({ ...prev, isLoading: true }));

        try {
          const result = await validateClientSession();

          setValidationState({
            isValid: result.isValid,
            isLoading: false,
            error: result.error,
            shouldRefresh: result.shouldRefresh || false,
          });

          // Auto-refresh session if needed
          if (result.shouldRefresh) {
            await fetch('/api/auth/session/refresh', { method: 'POST' });
          }
        } catch (error) {
          setValidationState({
            isValid: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Validation failed',
            shouldRefresh: false,
          });
        }
      }
    };

    validateSession();
  }, [session, status]);

  const refreshSession = async () => {
    setValidationState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/auth/session/refresh', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        setValidationState(prev => ({
          ...prev,
          isValid: true,
          isLoading: false,
          shouldRefresh: false,
        }));
      } else {
        setValidationState(prev => ({
          ...prev,
          isValid: false,
          isLoading: false,
          error: result.error,
        }));
      }
    } catch (error) {
      setValidationState(prev => ({
        ...prev,
        isValid: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Refresh failed',
      }));
    }
  };

  const validateSession = async () => {
    setValidationState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await validateClientSession();

      setValidationState({
        isValid: result.isValid,
        isLoading: false,
        error: result.error,
        shouldRefresh: result.shouldRefresh || false,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Validation failed';
      setValidationState({
        isValid: false,
        isLoading: false,
        error: errorMessage,
        shouldRefresh: false,
      });

      return {
        isValid: false,
        error: errorMessage,
      };
    }
  };

  return {
    ...validationState,
    refreshSession,
    validateSession,
    session,
  };
}
