import React, { useState } from 'react';
import { Filter, MessageSquare, ThumbsUp, Tag, Search, Loader2, Award, User, Link as LinkIcon, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useIdeas } from '../lib/api/ideas';
import { useVote, useUnvote } from '../lib/api/votes';
import { useAuth } from '../lib/auth';
import { useComments, useCreateComment } from '../lib/api/comments';

const categories = [
  'All',
  'Lammas - Accelerator & Native Apps',
  'Technology COE - Reusable Assets/Enablers',
  'Delivery - Process Improvement',
  'Industry Solutions - Domain Expertise & Business Use Cases',
  'Data Science',
  'Learning & Development',
  'Sales & Marketing',
  'Operations, HR, CSM, ESM, etc.',
] as const;

type Category = typeof categories[number];
type Status = 'All' | 'pending' | 'approved' | 'rejected';

const statuses: Status[] = ['All', 'pending', 'approved', 'rejected'];

// Category color mapping
const getCategoryColor = (category: Exclude<Category, 'All'>) => {
  const colorMap: Record<Exclude<Category, 'All'>, { bg: string; text: string; icon: string }> = {
    'Lammas - Accelerator & Native Apps': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: 'text-blue-500'
    },
    'Technology COE - Reusable Assets/Enablers': {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      icon: 'text-purple-500'
    },
    'Delivery - Process Improvement': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: 'text-green-500'
    },
    'Industry Solutions - Domain Expertise & Business Use Cases': {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      icon: 'text-orange-500'
    },
    'Data Science': {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      icon: 'text-indigo-500'
    },
    'Learning & Development': {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      icon: 'text-pink-500'
    },
    'Sales & Marketing': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: 'text-yellow-500'
    },
    'Operations, HR, CSM, ESM, etc.': {
      bg: 'bg-teal-100',
      text: 'text-teal-800',
      icon: 'text-teal-500'
    }
  };

  return colorMap[category];
};

export function BrowseIdeasPage() {
  const { user } = useAuth();
  const { data: ideas, isLoading: ideasLoading } = useIdeas();
  const { mutate: vote } = useVote();
  const { mutate: unvote } = useUnvote();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedStatus, setSelectedStatus] = useState<Status>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);
  const [newComment, setNewComment] = useState('');
  const { mutate: createComment } = useCreateComment();
  const { data: comments, isLoading: commentsLoading } = useComments(
    selectedIdea?.id || null
  );

  const filteredIdeas = ideas?.filter(idea => {
    const categoryMatch = selectedCategory === 'All' || idea.category === selectedCategory;
    const statusMatch = selectedStatus === 'All' || idea.status === selectedStatus;
    const searchMatch = 
      searchQuery === '' || 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && statusMatch && searchMatch;
  });

  const handleVoteToggle = (ideaId: string) => {
    if (!user) return;

    const idea = ideas?.find(i => i.id === ideaId);
    const hasVoted = idea?.votes?.some(v => v.user_id === user.id);

    if (hasVoted) {
      unvote({ ideaId, userId: user.id });
    } else {
      vote({ idea_id: ideaId, user_id: user.id });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedIdea || !newComment.trim()) return;

    createComment({
      idea_id: selectedIdea.id,
      author_id: user.id,
      content: newComment.trim()
    });

    setNewComment('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (ideasLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as Category)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Status)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {filteredIdeas?.length ?? 0} {(filteredIdeas?.length ?? 0) === 1 ? 'idea' : 'ideas'} found
          </h2>
        </div>

        {/* Ideas Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas?.map((idea) => {
            const categoryColor = getCategoryColor(idea.category);
            const hasVoted = idea.votes?.some(v => v.user_id === user?.id);
            
            return (
              <div
                key={idea.id}
                className="card cursor-pointer hover:scale-105 transition-all duration-300"
                onClick={() => setSelectedIdea(idea)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{idea.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                      {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{idea.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoteToggle(idea.id);
                        }}
                        className={cn(
                          "flex items-center text-gray-500 hover:text-indigo-600 transition-colors",
                          hasVoted && "text-indigo-600"
                        )}
                        disabled={!user}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {idea.votes?.length ?? 0}
                      </button>
                      <span className="flex items-center text-gray-500">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {idea.comments?.length ?? 0}
                      </span>
                      {idea.beans_earned > 0 && (
                        <span className="flex items-center text-yellow-600">
                          <Award className="h-4 w-4 mr-1" />
                          {idea.beans_earned}
                        </span>
                      )}
                    </div>
                    <div className={cn(
                      "flex items-center px-2.5 py-1 rounded-full",
                      categoryColor.bg
                    )}>
                      <Tag className={cn("h-4 w-4 mr-1", categoryColor.icon)} />
                      <span className={cn("truncate max-w-[150px]", categoryColor.text)} title={idea.category}>
                        {idea.category}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        By {idea.author?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-gray-400">
                        {new Date(idea.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Idea Detail Modal */}
        {selectedIdea && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedIdea.title}</h2>
                  <button
                    onClick={() => setSelectedIdea(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedIdea.status)}`}>
                      {selectedIdea.status.charAt(0).toUpperCase() + selectedIdea.status.slice(1)}
                    </span>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getCategoryColor(selectedIdea.category).bg,
                      getCategoryColor(selectedIdea.category).text
                    )}>
                      <Tag className={cn("h-3 w-3 mr-1", getCategoryColor(selectedIdea.category).icon)} />
                      {selectedIdea.category}
                    </span>
                    {selectedIdea.beans_earned > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Award className="h-3 w-3 mr-1" />
                        {selectedIdea.beans_earned} Beans
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{selectedIdea.description}</p>

                  {/* Contributors Section */}
                  {selectedIdea.contributors?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        Contributors
                      </h3>
                      <div className="space-y-2">
                        {selectedIdea.contributors.map((contributor: any) => (
                          <div key={contributor.user_id} className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {contributor.profiles?.full_name || 'Unnamed User'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {contributor.profiles?.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resource Links */}
                  {selectedIdea.resource_links?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Resource Links
                      </h3>
                      <div className="space-y-2">
                        {selectedIdea.resource_links.map((link: any) => (
                          <div key={link.id} className="flex items-center justify-between">
                            <div className="flex items-center text-sm">
                              <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{link.title}</p>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-500"
                                >
                                  {link.url}
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback Section */}
                  {selectedIdea.feedback && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Feedback</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                              <User className="h-3 w-3 text-indigo-600" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">
                                {selectedIdea.feedback_by?.full_name || 'Anonymous Admin'}
                              </span>
                              {selectedIdea.feedback_at && (
                                <span className="text-sm text-gray-500 ml-2">
                                  on {new Date(selectedIdea.feedback_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600">{selectedIdea.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Author and Date */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        By {selectedIdea.author?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-gray-400">
                        {new Date(selectedIdea.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Comments Section */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
                    
                    {user ? (
                      <form onSubmit={handleCommentSubmit} className="mb-6">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          rows={3}
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                          >
                            Post Comment
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-500 mb-6">
                        Please sign in to comment.
                      </p>
                    )}

                    {commentsLoading ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      </div>
                    ) : comments?.length ? (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.author?.full_name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No comments yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}