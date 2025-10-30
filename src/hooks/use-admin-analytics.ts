import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number; // Last 7 days
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  pendingReviewCourses: number;
  totalXPDistributed: number;
  totalLessonsCompleted: number;
  totalCoursesCompleted: number;
  totalCertificatesMinted: number;
  totalEducators: number;
  totalAdmins: number;
}

export interface UserGrowthData {
  date: string;
  count: number;
}

export interface CoursePerformance {
  id: string;
  title: string;
  enrollment_count: number;
  completion_count: number;
  completion_rate: number;
  average_rating: number;
}

export interface UserRoleDistribution {
  role: string;
  count: number;
}

/**
 * Fetch platform overview metrics
 */
export function usePlatformMetrics() {
  return useQuery({
    queryKey: ['admin', 'platform-metrics'],
    queryFn: async (): Promise<PlatformMetrics> => {
      // Fetch all metrics in parallel
      const [
        usersResult,
        activeUsersResult,
        coursesResult,
        draftsResult,
        pendingResult,
        xpResult,
        lessonsResult,
        completionsResult,
        certificatesResult,
        educatorsResult,
        adminsResult,
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('last_activity_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('course_drafts').select('id', { count: 'exact', head: true }).eq('draft_status', 'draft'),
        supabase.from('course_drafts').select('id', { count: 'exact', head: true }).eq('draft_status', 'pending_review'),
        supabase.from('users').select('total_xp'),
        supabase.from('lesson_completions').select('id', { count: 'exact', head: true }),
        supabase.from('user_progress').select('id', { count: 'exact', head: true }).not('completed_at', 'is', null),
        supabase.from('nft_certificates').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_educator', true),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_admin', true),
      ]);

      // Calculate total XP distributed
      const totalXP = xpResult.data?.reduce((sum, user) => sum + (user.total_xp || 0), 0) || 0;

      return {
        totalUsers: usersResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        totalCourses: coursesResult.count || 0,
        publishedCourses: coursesResult.count || 0, // All courses in courses table are published
        draftCourses: draftsResult.count || 0,
        pendingReviewCourses: pendingResult.count || 0,
        totalXPDistributed: totalXP,
        totalLessonsCompleted: lessonsResult.count || 0,
        totalCoursesCompleted: completionsResult.count || 0,
        totalCertificatesMinted: certificatesResult.count || 0,
        totalEducators: educatorsResult.count || 0,
        totalAdmins: adminsResult.count || 0,
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Fetch user growth data (last 30 days)
 */
export function useUserGrowthData() {
  return useQuery({
    queryKey: ['admin', 'user-growth'],
    queryFn: async (): Promise<UserGrowthData[]> => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at');

      if (error) throw error;

      // Group by date
      const groupedData: { [key: string]: number } = {};
      data.forEach((user) => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        groupedData[date] = (groupedData[date] || 0) + 1;
      });

      // Convert to array
      return Object.entries(groupedData).map(([date, count]) => ({
        date,
        count,
      }));
    },
  });
}

/**
 * Fetch top performing courses
 */
export function useTopCourses(limit: number = 10) {
  return useQuery({
    queryKey: ['admin', 'top-courses', limit],
    queryFn: async (): Promise<CoursePerformance[]> => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, enrollment_count, completion_count, average_rating')
        .order('enrollment_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((course) => ({
        ...course,
        completion_rate: course.enrollment_count > 0 ? (course.completion_count / course.enrollment_count) * 100 : 0,
      }));
    },
  });
}

/**
 * Fetch user role distribution
 */
export function useUserRoleDistribution() {
  return useQuery({
    queryKey: ['admin', 'user-role-distribution'],
    queryFn: async (): Promise<UserRoleDistribution[]> => {
      const { data: users, error } = await supabase.from('users').select('is_educator, is_admin');

      if (error) throw error;

      const distribution = {
        admin: 0,
        educator: 0,
        student: 0,
      };

      users.forEach((user) => {
        if (user.is_admin) {
          distribution.admin++;
        } else if (user.is_educator) {
          distribution.educator++;
        } else {
          distribution.student++;
        }
      });

      return [
        { role: 'Students', count: distribution.student },
        { role: 'Educators', count: distribution.educator },
        { role: 'Admins', count: distribution.admin },
      ];
    },
  });
}

/**
 * Fetch recent admin actions
 */
export function useRecentAdminActions(limit: number = 20) {
  return useQuery({
    queryKey: ['admin', 'recent-actions', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select(`
          *,
          admin:admin_user_id (
            id,
            username,
            avatar_emoji
          )
        `)
        .order('performed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Fetch engagement metrics
 */
export function useEngagementMetrics() {
  return useQuery({
    queryKey: ['admin', 'engagement-metrics'],
    queryFn: async () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [dauResult, wauResult, mauResult, avgSessionResult] = await Promise.all([
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('last_login_at', oneDayAgo),
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('last_login_at', oneWeekAgo),
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('last_login_at', oneMonthAgo),
        supabase
          .from('lesson_completions')
          .select('time_spent_seconds')
          .gte('completed_at', oneMonthAgo),
      ]);

      const avgSessionTime =
        avgSessionResult.data && avgSessionResult.data.length > 0
          ? avgSessionResult.data.reduce((sum, item) => sum + (item.time_spent_seconds || 0), 0) /
            avgSessionResult.data.length
          : 0;

      return {
        dau: dauResult.count || 0,
        wau: wauResult.count || 0,
        mau: mauResult.count || 0,
        avgSessionDuration: Math.round(avgSessionTime / 60), // Convert to minutes
      };
    },
  });
}

/**
 * Fetch learning metrics
 */
export function useLearningMetrics() {
  return useQuery({
    queryKey: ['admin', 'learning-metrics'],
    queryFn: async () => {
      const [
        lessonsResult,
        coursesResult,
        quizAttemptsResult,
        avgQuizScoreResult,
      ] = await Promise.all([
        supabase.from('lesson_completions').select('id', { count: 'exact', head: true }),
        supabase.from('user_progress').select('id', { count: 'exact', head: true }).not('completed_at', 'is', null),
        supabase.from('user_progress').select('total_quiz_attempts'),
        supabase.from('user_progress').select('average_quiz_score').not('average_quiz_score', 'is', null),
      ]);

      const totalQuizAttempts = quizAttemptsResult.data?.reduce(
        (sum, item) => sum + (item.total_quiz_attempts || 0),
        0
      ) || 0;

      const avgQuizScore =
        avgQuizScoreResult.data && avgQuizScoreResult.data.length > 0
          ? avgQuizScoreResult.data.reduce((sum, item) => sum + (Number(item.average_quiz_score) || 0), 0) /
            avgQuizScoreResult.data.length
          : 0;

      return {
        totalLessonsCompleted: lessonsResult.count || 0,
        totalCoursesCompleted: coursesResult.count || 0,
        totalQuizAttempts,
        averageQuizScore: Math.round(avgQuizScore),
      };
    },
  });
}
