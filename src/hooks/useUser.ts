/**
 * React Query hooks for user profile management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile, type UpdateUserProfileInput, type UpdateUserProfileResult } from '../lib/api/users';

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to update user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation<UpdateUserProfileResult, Error, { userId: string; updates: UpdateUserProfileInput }>({
    mutationFn: ({ userId, updates }) => updateUserProfile(userId, updates),
    onSuccess: (result) => {
      if (result.success && result.user) {
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['userStats'] });
      }
    },
  });
}
