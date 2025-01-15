import React, { useState } from 'react';
import { useIdeas } from '../lib/api/ideas';
import { useUsers } from '../lib/api/users';
import { Trophy, Medal, Award, Star, Crown, Users, Lightbulb, MessageSquare, ThumbsUp, Filter, Brain, Target, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

const timeRanges = ['All Time', 'This Year', 'This Month', 'This Week'] as const;
type TimeRange = typeof timeRanges[number];

export function LeaderboardPage() {
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

  const filteredIdeas = filterIdeasByTime(ideas || []);

  // Calculate user rankings
  const userRankings = users?.map(user => {
    const userIdeas = filteredIdeas.filter(idea => idea.author_id === user.id);
    const totalBeans = userIdeas.reduce((sum, idea) => sum + (idea.beans_earned || 0), 0);
    const totalVotes = userIdeas.reduce((sum, idea) => sum + (idea.votes?.length || 0), 0);
    const totalComments = userIdeas.reduce((sum, idea) => sum + (idea.comments?.length || 0), 0);
    const approvedIdeas = userIdeas.filter(idea => idea.status === 'approved').length;
    
    return {
      id: user.id,
      name: user.full_name || 'Anonymous',
      email: user.email,
      department: user.department,
      ideasCount: userIdeas.length,
      approvedIdeas,
      totalBeans,
      totalVotes,
      totalComments,
      score: totalBeans * 3 + approvedIdeas * 5 + totalVotes + totalComments
    };
  }).sort((a, b) => b.score - a.score) || [];

  // Calculate category champions
  const categoryChampions = Object.entries(
    filteredIdeas.reduce((acc: Record<string, any[]>, idea) => {
      if (!acc[idea.category]) acc[idea.category] = [];
      acc[idea.category].push(idea);
      return acc;
    }, {})
  ).map(([category, ideas]) => {
    const topContributor = users?.find(user => 
      user.id === ideas.reduce((acc, idea) => {
        const current = ideas.filter(i => i.author_id === idea.author_id).length;
        const max = ideas.filter(i => i.author_id === acc).length;
        return current > max ? idea.author_id : acc;
      }, ideas[0]?.author_id)
    );

    return {
      category,
      ideasCount: ideas.length,
      topContributor: topContributor?.full_name || 'Anonymous',
      topContributorEmail: topContributor?.email,
      totalBeans: ideas.reduce((sum, idea) => sum + (idea.beans_earned || 0), 0)
    };
  }).sort((a, b) => b.ideasCount - a.ideasCount);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-indigo-400" />;
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Innovation Champions</h1>
          <p className="text-lg text-gray-600">
            Celebrating our top contributors and their impactful ideas
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex justify-end mb-8">
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

        {/* Top Contributors */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Users className="h-6 w-6 mr-2 text-indigo-600" />
            Top Contributors
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userRankings.slice(0, 9).map((user, index) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getPositionIcon(index)}
                    </div>
                    <div className="ml-3">
                      <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.department || 'No Department'}</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">#{index + 1}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1 text-blue-500" />
                    <span>{user.approvedIdeas} approved ideas</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1 text-yellow-500" />
                    <span>{user.totalBeans} beans</span>
                  </div>
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                    <span>{user.totalVotes} votes</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1 text-purple-500" />
                    <span>{user.totalComments} comments</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Total Score</span>
                    <span className="font-semibold text-indigo-600">{user.score} points</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Champions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="h-6 w-6 mr-2 text-indigo-600" />
            Category Champions
          </h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Top Contributor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ideas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beans Earned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryChampions.map((champion, index) => (
                  <tr key={champion.category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Brain className="h-5 w-5 text-indigo-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {champion.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index < 3 && (
                          <div className="flex-shrink-0 mr-2">
                            {getPositionIcon(index)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {champion.topContributor}
                          </div>
                          <div className="text-sm text-gray-500">
                            {champion.topContributorEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{champion.ideasCount} ideas</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Award className="h-4 w-4 mr-1 text-yellow-500" />
                        {champion.totalBeans}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}