import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';
import { Plus, Search, Award } from 'lucide-react';

export function BadgesTab() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'learning' | 'social' | 'special'>('all');

  const { data: badges, isLoading } = useQuery({
    queryKey: ['admin', 'badges', categoryFilter, search],
    queryFn: async () => {
      let query = supabase.from('achievements').select('*').order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Badges & Achievements</h2>
        <button className="px-4 py-2 bg-[#0084C7] text-white rounded-xl hover:bg-[#0074b7] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Badge
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search badges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as any)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
        >
          <option value="all">All Categories</option>
          <option value="learning">Learning</option>
          <option value="social">Social</option>
          <option value="special">Special</option>
        </select>
      </div>

      {/* Badges Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-[#0084C7] border-t-transparent rounded-full" />
        </div>
      ) : badges && badges.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">No badges found</div>
      )}
    </div>
  );
}

function BadgeCard({ badge }: { badge: any }) {
  const rarityColors = {
    common: {
      bg: 'from-gray-50 to-gray-100',
      border: 'border-gray-200',
      text: 'text-gray-700',
      glow: 'shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
    },
    rare: {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-700',
      glow: 'shadow-[0_4px_16px_rgba(59,130,246,0.15)]'
    },
    epic: {
      bg: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-700',
      glow: 'shadow-[0_4px_16px_rgba(168,85,247,0.2)]'
    },
    legendary: {
      bg: 'from-amber-50 to-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-700',
      glow: 'shadow-[0_4px_16px_rgba(251,191,36,0.25)]'
    }
  };

  const colors = rarityColors[badge.rarity as keyof typeof rarityColors] || rarityColors.common;

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl md:rounded-2xl p-3 md:p-4 ${colors.glow} hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all relative`}
    >
      {/* Badge Icon */}
      <div className="flex justify-center mb-2 md:mb-3">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
          <span className="text-2xl md:text-4xl">{badge.icon_emoji}</span>
        </div>
      </div>

      {/* Badge Name */}
      <h4 className={`text-center mb-1 text-sm md:text-base ${colors.text} font-bold line-clamp-1`}>
        {badge.name}
      </h4>

      {/* Badge Rarity */}
      <p className={`text-xs text-center ${colors.text} opacity-80 mb-2 uppercase tracking-wide font-medium`}>
        {badge.rarity}
      </p>

      {/* Badge Description */}
      <p className="text-xs text-center text-gray-600 mb-2 md:mb-3 line-clamp-2">
        {badge.description}
      </p>

      {/* Times Earned (Admin View) */}
      <div className="pt-2 md:pt-3 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          Earned {badge.times_earned || 0} times
        </p>
      </div>

      {/* XP Reward Badge */}
      <div className="mt-2 md:mt-3 flex items-center justify-center gap-1">
        <Award className="w-3 h-3 text-gray-500" />
        <span className="text-xs text-gray-600 font-medium">+{badge.xp_reward} XP</span>
      </div>
    </div>
  );
}
