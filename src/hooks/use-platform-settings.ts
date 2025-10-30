import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all platform settings
 */
export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      return data as PlatformSetting[];
    },
  });
}

/**
 * Fetch a single platform setting by key
 */
export function usePlatformSetting(settingKey: string) {
  return useQuery({
    queryKey: ['platform-setting', settingKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('setting_key', settingKey)
        .single();

      if (error) throw error;
      return data as PlatformSetting;
    },
    enabled: !!settingKey,
  });
}

/**
 * Update a platform setting
 */
export function useUpdatePlatformSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      settingKey,
      settingValue,
      adminUserId,
    }: {
      settingKey: string;
      settingValue: any;
      adminUserId: string;
    }) => {
      // Fetch old value for audit log
      const { data: oldSetting } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', settingKey)
        .single();

      // Update setting
      const { data, error } = await supabase
        .from('platform_settings')
        .update({
          setting_value: settingValue,
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', settingKey)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: adminUserId,
        p_action_type: 'setting_update',
        p_target_resource_type: 'setting',
        p_target_resource_id: settingKey,
        p_action_details: {
          setting_key: settingKey,
          new_value: settingValue,
        },
        p_changes_made: {
          old_value: oldSetting?.setting_value,
          new_value: settingValue,
        },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['platform-setting', variables.settingKey] });
    },
  });
}

/**
 * Get setting value by key (helper function)
 */
export function getSettingValue(settings: PlatformSetting[] | undefined, key: string, defaultValue: any = null): any {
  const setting = settings?.find(s => s.setting_key === key);
  return setting?.setting_value ?? defaultValue;
}

/**
 * Typed helper hooks for specific settings
 */

export function useContentCreationSettings() {
  const { data: settings } = usePlatformSettings();

  return {
    allowUserCourseCreation: getSettingValue(settings, 'allow_user_course_creation', { enabled: true }).enabled,
    autoAcceptEducators: getSettingValue(settings, 'auto_accept_educators', { enabled: true }).enabled,
    autoPublishEducatorCourses: getSettingValue(settings, 'auto_publish_educator_courses', { enabled: false }).enabled,
  };
}

export function useXPSettings() {
  const { data: settings } = usePlatformSettings();

  return {
    lessonCompletion: getSettingValue(settings, 'xp_lesson_completion', { amount: 10 }).amount,
    quizPerfect: getSettingValue(settings, 'xp_quiz_perfect', { amount: 30 }).amount,
    quizPassingScore: getSettingValue(settings, 'xp_quiz_passing_score', { percentage: 70 }).percentage,
    courseCompletion: getSettingValue(settings, 'xp_course_completion', { amount: 100 }).amount,
    dailyLogin: getSettingValue(settings, 'xp_daily_login', { amount: 5 }).amount,
    discussionReply: getSettingValue(settings, 'xp_discussion_reply', { amount: 2 }).amount,
  };
}

export function useFeatureFlags() {
  const { data: settings } = usePlatformSettings();

  return {
    aiTutor: getSettingValue(settings, 'feature_ai_tutor', { enabled: true }).enabled,
    nftCertificates: getSettingValue(settings, 'feature_nft_certificates', { enabled: true }).enabled,
    discussions: getSettingValue(settings, 'feature_discussions', { enabled: true }).enabled,
    leaderboards: getSettingValue(settings, 'feature_leaderboards', { enabled: true }).enabled,
    maintenanceMode: getSettingValue(settings, 'maintenance_mode', { enabled: false }),
  };
}

export function useFaucetSettings() {
  const { data: settings } = usePlatformSettings();

  return {
    enabled: getSettingValue(settings, 'faucet_enabled', { enabled: true }).enabled,
    dailyLimit: getSettingValue(settings, 'faucet_daily_limit', { amount_hbar: 10 }).amount_hbar,
    cooldownHours: getSettingValue(settings, 'faucet_cooldown_hours', { hours: 24 }).hours,
  };
}

export function useNotificationSettings() {
  const { data: settings } = usePlatformSettings();

  return {
    emailNotifications: getSettingValue(settings, 'email_notifications', { enabled: true }).enabled,
    courseCompletion: getSettingValue(settings, 'notify_course_completion', { enabled: true }).enabled,
    badgeEarned: getSettingValue(settings, 'notify_badge_earned', { enabled: true }).enabled,
    courseReview: getSettingValue(settings, 'notify_course_review', { enabled: true }).enabled,
    weeklyReports: getSettingValue(settings, 'weekly_reports', { enabled: true }).enabled,
  };
}
