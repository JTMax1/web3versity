import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';
import { Plus, Search } from 'lucide-react';

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search badges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
        >
          <option value="all">All Categories</option>
          <option value="learning">Learning</option>
          <option value="social">Social</option>
          <option value="special">Special</option>
        </select>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-[#0084C7] border-t-transparent rounded-full" />
          </div>
        ) : badges && badges.length > 0 ? (
          badges.map((badge) => (
            <div key={badge.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-5xl mb-3 text-center">{badge.icon_emoji}</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">{badge.name}</h3>
              <p className="text-sm text-gray-600 mb-4 text-center line-clamp-2">{badge.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-1 rounded-lg font-medium ${
                  badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                  badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                  badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {badge.rarity}
                </span>
                <span className="text-gray-600">{badge.times_earned} earned</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">No badges found</div>
        )}
      </div>
    </div>
  );
}
