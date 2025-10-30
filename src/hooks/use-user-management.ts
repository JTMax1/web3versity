import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import type { User } from '../lib/supabase/types';

export interface UserWithStats extends User {
  courses_in_progress?: number;
}

/**
 * Fetch all users with optional filtering
 */
export function useAllUsers(filters?: {
  role?: 'all' | 'student' | 'educator' | 'admin';
  search?: string;
  sortBy?: 'join_date' | 'xp' | 'activity';
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['admin', 'all-users', filters],
    queryFn: async (): Promise<UserWithStats[]> => {
      let query = supabase.from('users').select('*');

      // Apply role filter
      if (filters?.role && filters.role !== 'all') {
        if (filters.role === 'admin') {
          query = query.eq('is_admin', true);
        } else if (filters.role === 'educator') {
          query = query.eq('is_educator', true).eq('is_admin', false);
        } else if (filters.role === 'student') {
          query = query.eq('is_educator', false).eq('is_admin', false);
        }
      }

      // Apply search filter
      if (filters?.search) {
        query = query.or(
          `username.ilike.%${filters.search}%,email.ilike.%${filters.search}%,evm_address.ilike.%${filters.search}%`
        );
      }

      // Apply sorting
      if (filters?.sortBy) {
        const sortField =
          filters.sortBy === 'join_date'
            ? 'created_at'
            : filters.sortBy === 'xp'
            ? 'total_xp'
            : 'last_activity_date';
        query = query.order(sortField, { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Update user role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isEducator,
      isAdmin,
      adminUserId,
    }: {
      userId: string;
      isEducator: boolean;
      isAdmin: boolean;
      adminUserId: string;
    }) => {
      // Fetch old user data for audit
      const { data: oldUser } = await supabase.from('users').select('*').eq('id', userId).single();

      // Update user role
      const { data, error } = await supabase
        .from('users')
        .update({
          is_educator: isEducator,
          is_admin: isAdmin,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      const roleChange = isAdmin ? 'admin' : isEducator ? 'educator' : 'student';
      const oldRole = oldUser?.is_admin ? 'admin' : oldUser?.is_educator ? 'educator' : 'student';

      await supabase.rpc('log_admin_action', {
        p_admin_user_id: adminUserId,
        p_action_type: 'user_role_change',
        p_target_resource_type: 'user',
        p_target_resource_id: userId,
        p_action_details: {
          username: oldUser?.username,
          new_role: roleChange,
        },
        p_changes_made: {
          old_role: oldRole,
          new_role: roleChange,
          is_educator: { old: oldUser?.is_educator, new: isEducator },
          is_admin: { old: oldUser?.is_admin, new: isAdmin },
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'platform-metrics'] });
    },
  });
}

/**
 * Suspend/activate user account
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isActive,
      adminUserId,
    }: {
      userId: string;
      isActive: boolean;
      adminUserId: string;
    }) => {
      // Fetch user for audit
      const { data: user } = await supabase.from('users').select('username').eq('id', userId).single();

      // Update user status
      const { data, error } = await supabase
        .from('users')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: adminUserId,
        p_action_type: isActive ? 'user_activate' : 'user_suspend',
        p_target_resource_type: 'user',
        p_target_resource_id: userId,
        p_action_details: {
          username: user?.username,
          action: isActive ? 'activated' : 'suspended',
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-users'] });
    },
  });
}

/**
 * Bulk update user roles
 */
export function useBulkUpdateUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userIds,
      isEducator,
      isAdmin,
      adminUserId,
    }: {
      userIds: string[];
      isEducator?: boolean;
      isAdmin?: boolean;
      adminUserId: string;
    }) => {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (isEducator !== undefined) updateData.is_educator = isEducator;
      if (isAdmin !== undefined) updateData.is_admin = isAdmin;

      // Update all users
      const { data, error } = await supabase.from('users').update(updateData).in('id', userIds).select();

      if (error) throw error;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: adminUserId,
        p_action_type: 'bulk_operation',
        p_target_resource_type: 'user',
        p_action_details: {
          operation: 'bulk_role_update',
          user_count: userIds.length,
          changes: updateData,
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'platform-metrics'] });
    },
  });
}

/**
 * Get user activity log
 */
export function useUserActivityLog(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user-activity', userId],
    queryFn: async () => {
      const [lessons, courses, discussions] = await Promise.all([
        supabase
          .from('lesson_completions')
          .select('*, lesson:lesson_id(title), course:course_id(title)')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(10),
        supabase
          .from('user_progress')
          .select('*, course:course_id(title)')
          .eq('user_id', userId)
          .order('enrollment_date', { ascending: false })
          .limit(10),
        supabase
          .from('discussions')
          .select('*')
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      return {
        recentLessons: lessons.data || [],
        enrolledCourses: courses.data || [],
        discussions: discussions.data || [],
      };
    },
    enabled: !!userId,
  });
}

/**
 * Fetch user statistics
 */
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user-stats', userId],
    queryFn: async () => {
      const [user, achievements, certificates, discussions] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('user_achievements').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('nft_certificates').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('discussions').select('id', { count: 'exact', head: true }).eq('author_id', userId),
      ]);

      return {
        user: user.data,
        totalAchievements: achievements.count || 0,
        totalCertificates: certificates.count || 0,
        totalDiscussions: discussions.count || 0,
      };
    },
    enabled: !!userId,
  });
}
