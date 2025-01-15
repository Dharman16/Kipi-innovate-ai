import React, { useState } from 'react';
import { useIdeas } from '../../lib/api/ideas';
import { useUsers } from '../../lib/api/users';
import { 
  BarChart3, 
  Users, 
  Lightbulb, 
  Award, 
  TrendingUp, 
  MessageSquare, 
  Download,
  Calendar,
  Filter,
  PieChart,
  Target,
  ThumbsUp,
  Clock,
  CheckCircle,
  XCircle,
  Brain,
  Medal,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';

const timeRanges = ['All Time', 'This Year', 'This Month', 'This Week'] as const;
type TimeRange = typeof timeRanges[number];

export function Analytics() {
  const { data: ideas } = useIdeas();
  const { data: users } = useUsers();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('All Time');

  // Filter ideas based on time range
  const filterIdeasByTime = (ideas: any[]) => {
    if (!ideas) return [];
    const now = new Date();
    
    switch (selectedTimeRange) {
      case 'This Week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return ideas.filter(idea => new Date(idea.created_at) >= weekAgo);
      case 'This Month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        return ideas.filter(idea => new Date(idea.created_at) >= monthAgo);
      case 'This Year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return ideas.filter(idea => new Date(idea.created_at) >= yearStart);
      default:
        return ideas;
    }
  };

  const filteredIdeas = filterIdeasByTime(ideas);

  // Calculate statistics
  const stats = {
    totalIdeas: filteredIdeas.length,
    totalUsers: users?.length || 0,
    activeUsers: users?.filter(user => user.ideas?.[0]?.count > 0).length || 0,
    approvedIdeas: filteredIdeas.filter(idea => idea.status === 'approved').length,
    rejectedIdeas: filteredIdeas.filter(idea => idea.status === 'rejected').length,
    pendingIdeas: filteredIdeas.filter(idea => idea.status === 'pending').length,
    totalBeans: filteredIdeas.reduce((sum, idea) => sum + (idea.beans_earned || 0), 0),
    totalComments: filteredIdeas.reduce((sum, idea) => sum + (idea.comments?.length || 0), 0),
    totalVotes: filteredIdeas.reduce((sum, idea) => sum + (idea.votes?.length || 0), 0),
    avgBeansPerIdea: filteredIdeas.length 
      ? Math.round((filteredIdeas.reduce((sum, idea) => sum + (idea.beans_earned || 0), 0) / filteredIdeas.length) * 10) / 10
      : 0,
    avgCommentsPerIdea: filteredIdeas.length
      ? Math.round((filteredIdeas.reduce((sum, idea) => sum + (idea.comments?.length || 0), 0) / filteredIdeas.length) * 10) / 10
      : 0,
    avgVotesPerIdea: filteredIdeas.length
      ? Math.round((filteredIdeas.reduce((sum, idea) => sum + (idea.votes?.length || 0), 0) / filteredIdeas.length) * 10) / 10
      : 0
  };

  // Calculate category distribution
  const categoryStats = filteredIdeas.reduce((acc: Record<string, number>, idea) => {
    acc[idea.category] = (acc[idea.category] || 0) + 1;
    return acc;
  }, {});

  // Calculate monthly submissions
  const monthlyStats = filteredIdeas.reduce((acc: Record<string, number>, idea) => {
    const month = new Date(idea.created_at).toLocaleString('default', { month: 'long' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  // Calculate user engagement metrics
  const userEngagement = {
    totalActiveUsers: users?.filter(user => user.ideas?.[0]?.count > 0).length || 0,
    totalContributors: new Set(filteredIdeas.flatMap(idea => 
      idea.contributors?.map(c => c.user_id) || []
    )).size,
    mostActiveUsers: users
      ?.filter(user => user.ideas?.[0]?.count > 0)
      .sort((a, b) => (b.ideas?.[0]?.count || 0) - (a.ideas?.[0]?.count || 0))
      .slice(0, 5) || []
  };

  const downloadCSV = (data: any[], filename: string) => {
    const csvContent = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"`
          : value
      ).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadIdeasData = () => {
    if (!filteredIdeas) return;

    const headers = ['Title,Category,Status,Beans,Comments,Votes,Created At\n'];
    const csvData = filteredIdeas.map(idea => ({
      title: idea.title,
      category: idea.category,
      status: idea.status,
      beans: idea.beans_earned || 0,
      comments: idea.comments?.length || 0,
      votes: idea.votes?.length || 0,
      created_at: new Date(idea.created_at).toLocaleDateString()
    }));

    downloadCSV([...headers, ...csvData], 'ideas-data.csv');
  };

  const downloadCategoryStats = () => {
    const headers = ['Category,Count\n'];
    const csvData = Object.entries(categoryStats).map(([category, count]) => ({
      category,
      count
    }));

    downloadCSV([...headers, ...csvData], 'category-stats.csv');
  };

  const downloadMonthlyStats = () => {
    const headers = ['Month,Submissions\n'];
    const csvData = Object.entries(monthlyStats).map(([month, count]) => ({
      month,
      count
    }));

    downloadCSV([...headers, ...csvData], 'monthly-stats.csv');
  };

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md shadow-sm">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={cn(
                "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                selectedTimeRange === range
                  ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50",
                "first:rounded-l-md last:rounded-r-md"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ideas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalIdeas}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Lightbulb className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-green-600">
              <span className="font-medium">{stats.approvedIdeas}</span> approved
            </div>
            <div className="text-yellow-600">
              <span className="font-medium">{stats.pendingIdeas}</span> pending
            </div>
            <div className="text-red-600">
              <span className="font-medium">{stats.rejectedIdeas}</span> rejected
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Engagement</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {userEngagement.totalActiveUsers} active users ({Math.round((userEngagement.totalActiveUsers / stats.totalUsers) * 100)}%)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Beans</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBeans}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {stats.avgBeansPerIdea} beans per idea
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round((stats.totalComments + stats.totalVotes) / stats.totalIdeas * 10) / 10}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>{stats.totalComments} comments</span>
            <span>{stats.totalVotes} votes</span>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
            Category Distribution
          </h3>
          <button
            onClick={downloadCategoryStats}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-1" />
            Download CSV
          </button>
        </div>
        <div className="space-y-4">
          {Object.entries(categoryStats).map(([category, count]) => (
            <div key={category}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span className="flex items-center">
                  <Target className="h-4 w-4 mr-2 text-indigo-600" />
                  {category}
                </span>
                <span className="font-medium">{count} ideas</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${(count / stats.totalIdeas) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
            Monthly Submissions
          </h3>
          <button
            onClick={downloadMonthlyStats}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-1" />
            Download CSV
          </button>
        </div>
        <div className="space-y-4">
          {Object.entries(monthlyStats).map(([month, count]) => (
            <div key={month}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                  {month}
                </span>
                <span className="font-medium">{count} ideas</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${(count / Math.max(...Object.values(monthlyStats))) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Star className="h-5 w-5 mr-2 text-indigo-600" />
            Top Contributors
          </h3>
        </div>
        <div className="space-y-4">
          {userEngagement.mostActiveUsers.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{user.full_name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {user.ideas?.[0]?.count || 0} ideas
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {user.comments?.[0]?.count || 0} comments
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Data */}
      <div className="flex justify-end">
        <button
          onClick={downloadIdeasData}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Full Data
        </button>
      </div>
    </div>
  );
}