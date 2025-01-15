import React, { useState } from 'react';
import { Analytics } from '../components/admin/Analytics';
import { UserManagement } from '../components/admin/UserManagement';
import { IdeaManagement } from '../components/admin/IdeaManagement';
import { IdeaImport } from '../components/admin/IdeaImport';
import { cn } from '../lib/utils';
import { BarChart3, Users, Settings, FileUp } from 'lucide-react';

const tabs = [
  { id: 'ideas', name: 'Idea Management', icon: Settings },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'users', name: 'User Management', icon: Users },
  { id: 'import', name: 'Import Ideas', icon: FileUp }
] as const;

type TabId = typeof tabs[number]['id'];

export function AdminPage() {
  const [currentTab, setCurrentTab] = useState<TabId>('ideas');

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="sm:hidden">
            <select
              value={currentTab}
              onChange={(e) => setCurrentTab(e.target.value as TabId)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={cn(
                        currentTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm'
                      )}
                    >
                      <Icon className={cn(
                        'mr-2 h-5 w-5',
                        currentTab === tab.id
                          ? 'text-indigo-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )} />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {currentTab === 'analytics' && <Analytics />}
          {currentTab === 'users' && <UserManagement />}
          {currentTab === 'ideas' && <IdeaManagement />}
          {currentTab === 'import' && <IdeaImport />}
        </div>
      </div>
    </div>
  );
}