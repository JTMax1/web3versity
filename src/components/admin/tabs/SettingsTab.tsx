import React, { useState } from 'react';
import { usePlatformSettings, useUpdatePlatformSetting } from '../../../hooks/use-platform-settings';
import { useWallet } from '../../../contexts/WalletContext';
import { Save } from 'lucide-react';

export function SettingsTab() {
  const { user } = useWallet();
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();

  const [formData, setFormData] = useState<{ [key: string]: any }>({});

  React.useEffect(() => {
    if (settings) {
      const data: { [key: string]: any } = {};
      settings.forEach(s => {
        data[s.setting_key] = s.setting_value;
      });
      setFormData(data);
    }
  }, [settings]);

  const handleToggle = (key: string, field: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: !prev[key]?.[field]
      }
    }));
  };

  const handleNumberChange = (key: string, field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      for (const [key, value] of Object.entries(formData)) {
        await updateSetting.mutateAsync({
          settingKey: key,
          settingValue: value,
          adminUserId: user.id,
        });
      }
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#0084C7] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
        <button
          onClick={handleSave}
          disabled={updateSetting.isPending}
          className="px-6 py-3 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_4px_16px_rgba(0,132,199,0.3)]"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Content Creation Settings */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.02),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Content Creation Permissions</h3>
        <div className="space-y-6">
          <ToggleSetting
            label="Allow users/educators to create courses"
            description="When disabled, only admins can create courses"
            checked={formData.allow_user_course_creation?.enabled ?? true}
            onChange={() => handleToggle('allow_user_course_creation', 'enabled')}
          />
          <ToggleSetting
            label="Auto-accept educator applications"
            description="Automatically approve educator role requests"
            checked={formData.auto_accept_educators?.enabled ?? true}
            onChange={() => handleToggle('auto_accept_educators', 'enabled')}
          />
          <ToggleSetting
            label="Auto-approve & publish educator courses"
            description="Skip review process for educator submissions"
            checked={formData.auto_publish_educator_courses?.enabled ?? false}
            onChange={() => handleToggle('auto_publish_educator_courses', 'enabled')}
          />
        </div>
      </div>

      {/* XP Configuration */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.02),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">XP & Rewards Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NumberSetting
            label="Lesson completion XP"
            value={formData.xp_lesson_completion?.amount ?? 10}
            onChange={(val) => handleNumberChange('xp_lesson_completion', 'amount', val)}
          />
          <NumberSetting
            label="Quiz perfect score bonus"
            value={formData.xp_quiz_perfect?.amount ?? 30}
            onChange={(val) => handleNumberChange('xp_quiz_perfect', 'amount', val)}
          />
          <NumberSetting
            label="Quiz passing score (%)"
            value={formData.xp_quiz_passing_score?.percentage ?? 70}
            onChange={(val) => handleNumberChange('xp_quiz_passing_score', 'percentage', val)}
          />
          <NumberSetting
            label="Course completion XP"
            value={formData.xp_course_completion?.amount ?? 100}
            onChange={(val) => handleNumberChange('xp_course_completion', 'amount', val)}
          />
          <NumberSetting
            label="Daily login streak XP"
            value={formData.xp_daily_login?.amount ?? 5}
            onChange={(val) => handleNumberChange('xp_daily_login', 'amount', val)}
          />
          <NumberSetting
            label="Discussion reply XP"
            value={formData.xp_discussion_reply?.amount ?? 2}
            onChange={(val) => handleNumberChange('xp_discussion_reply', 'amount', val)}
          />
        </div>
      </div>

      {/* Platform Features */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.02),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Features</h3>
        <div className="space-y-6">
          <ToggleSetting
            label="Enable AI tutor chat"
            checked={formData.feature_ai_tutor?.enabled ?? true}
            onChange={() => handleToggle('feature_ai_tutor', 'enabled')}
          />
          <ToggleSetting
            label="Enable NFT certificates"
            checked={formData.feature_nft_certificates?.enabled ?? true}
            onChange={() => handleToggle('feature_nft_certificates', 'enabled')}
          />
          <ToggleSetting
            label="Enable discussion forums"
            checked={formData.feature_discussions?.enabled ?? true}
            onChange={() => handleToggle('feature_discussions', 'enabled')}
          />
          <ToggleSetting
            label="Enable leaderboards"
            checked={formData.feature_leaderboards?.enabled ?? true}
            onChange={() => handleToggle('feature_leaderboards', 'enabled')}
          />
          <ToggleSetting
            label="Maintenance mode"
            checked={formData.maintenance_mode?.enabled ?? false}
            onChange={() => handleToggle('maintenance_mode', 'enabled')}
          />
        </div>
      </div>

      {/* Blockchain Settings */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.02),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Hedera Blockchain Configuration</h3>
        <div className="space-y-6">
          <ToggleSetting
            label="Faucet enabled"
            checked={formData.faucet_enabled?.enabled ?? true}
            onChange={() => handleToggle('faucet_enabled', 'enabled')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberSetting
              label="Faucet daily limit (HBAR)"
              description="Maximum HBAR a user can request per cooldown period"
              value={formData.faucet_daily_limit?.amount_hbar ?? 10}
              onChange={(val) => handleNumberChange('faucet_daily_limit', 'amount_hbar', val)}
            />
            <NumberSetting
              label="Faucet cooldown (hours)"
              description="Cooldown time before user can request faucet again"
              value={formData.faucet_cooldown_hours?.hours ?? 24}
              onChange={(val) => handleNumberChange('faucet_cooldown_hours', 'hours', val)}
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.02),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h3>
        <div className="space-y-6">
          <ToggleSetting
            label="Email notifications enabled"
            checked={formData.email_notifications?.enabled ?? true}
            onChange={() => handleToggle('email_notifications', 'enabled')}
          />
          <ToggleSetting
            label="Notify on course completion"
            checked={formData.notify_course_completion?.enabled ?? true}
            onChange={() => handleToggle('notify_course_completion', 'enabled')}
          />
          <ToggleSetting
            label="Notify on badge earned"
            checked={formData.notify_badge_earned?.enabled ?? true}
            onChange={() => handleToggle('notify_badge_earned', 'enabled')}
          />
          <ToggleSetting
            label="Notify educators on course review"
            checked={formData.notify_course_review?.enabled ?? true}
            onChange={() => handleToggle('notify_course_review', 'enabled')}
          />
          <ToggleSetting
            label="Weekly progress reports"
            checked={formData.weekly_reports?.enabled ?? true}
            onChange={() => handleToggle('weekly_reports', 'enabled')}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-4">
        <div className="text-base font-medium text-gray-900">
          {label}
        </div>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0084C7] focus:ring-offset-2 ${
          checked ? 'bg-[#0084C7]' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function NumberSetting({ label, description, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
      {description && <p className="text-xs text-gray-600 mb-3">{description}</p>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0084C7] focus:border-transparent shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
      />
    </div>
  );
}
