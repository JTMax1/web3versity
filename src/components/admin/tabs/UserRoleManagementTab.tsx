import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Search, Shield, GraduationCap, User, MoreVertical } from 'lucide-react';
import { useAllUsers, useUpdateUserRole, useBulkUpdateUserRoles } from '../../../hooks/use-user-management';
import { useWallet } from '../../../contexts/WalletContext';

type RoleFilter = 'all' | 'student' | 'educator' | 'admin';
type SortBy = 'join_date' | 'xp' | 'activity';

export function UserRoleManagementTab() {
  const { user: currentUser } = useWallet();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('join_date');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const { data: users, isLoading } = useAllUsers({
    role: roleFilter,
    search: search,
    sortBy: sortBy,
    sortOrder: 'desc',
  });

  const updateRole = useUpdateUserRole();
  const bulkUpdateRoles = useBulkUpdateUserRoles();

  const handleRoleChange = async (userId: string, role: 'student' | 'educator' | 'admin') => {
    if (!currentUser?.id) return;

    await updateRole.mutateAsync({
      userId,
      isEducator: role === 'educator' || role === 'admin',
      isAdmin: role === 'admin',
      adminUserId: currentUser.id,
    });
  };

  const handleBulkRoleChange = async (role: 'student' | 'educator' | 'admin') => {
    if (!currentUser?.id || selectedUsers.size === 0) return;

    await bulkUpdateRoles.mutateAsync({
      userIds: Array.from(selectedUsers),
      isEducator: role === 'educator' || role === 'admin',
      isAdmin: role === 'admin',
      adminUserId: currentUser.id,
    });

    setSelectedUsers(new Set());
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAll = () => {
    if (users && selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else if (users) {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by username, email, or wallet address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7] focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="educator">Educators</option>
            <option value="admin">Admins</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
          >
            <option value="join_date">Join Date</option>
            <option value="xp">Total XP</option>
            <option value="activity">Last Activity</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <span className="text-sm font-medium text-blue-900">
            {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkRoleChange('student')}
              className="px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Make Students
            </button>
            <button
              onClick={() => handleBulkRoleChange('educator')}
              className="px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Make Educators
            </button>
            <button
              onClick={() => handleBulkRoleChange('admin')}
              className="px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Make Admins
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-[#0084C7] border-t-transparent rounded-full" />
          </div>
        ) : users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={users && selectedUsers.size === users.length}
                      onChange={selectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#0084C7] focus:ring-[#0084C7]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    XP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => {
                  const role = user.is_admin ? 'admin' : user.is_educator ? 'educator' : 'student';

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0084C7] focus:ring-[#0084C7]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#0084C7] to-[#00a8e8] rounded-full flex items-center justify-center text-white text-lg">
                            {user.avatar_emoji || '👤'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.username}</div>
                            {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-gray-600">
                          {user.evm_address.slice(0, 6)}...{user.evm_address.slice(-4)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={role} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{user.total_xp.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{user.courses_completed}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors outline-none">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              className="w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
                              align="end"
                              sideOffset={5}
                            >
                              <DropdownMenu.Item
                                onSelect={() => handleRoleChange(user.id, 'student')}
                                disabled={role === 'student'}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed outline-none cursor-pointer"
                              >
                                Make Student
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onSelect={() => handleRoleChange(user.id, 'educator')}
                                disabled={role === 'educator'}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed outline-none cursor-pointer"
                              >
                                Make Educator
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onSelect={() => handleRoleChange(user.id, 'admin')}
                                disabled={role === 'admin'}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed outline-none cursor-pointer"
                              >
                                Make Admin
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No users found</div>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: 'student' | 'educator' | 'admin' }) {
  const styles = {
    student: { bg: 'bg-gray-100', text: 'text-gray-700', icon: User },
    educator: { bg: 'bg-blue-100', text: 'text-blue-700', icon: GraduationCap },
    admin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Shield },
  };

  const { bg, text, icon: Icon } = styles[role];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3.5 h-3.5" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}
