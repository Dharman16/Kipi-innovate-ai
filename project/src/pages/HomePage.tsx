import React from 'react';
import { Trophy, Brain, CheckCircle, XCircle, Clock, Bean, Sparkles, ArrowRight, Users, Zap, Target, ClipboardList, Award, Presentation, Medal, TrendingUp, MessageSquare, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIdeas } from '../lib/api/ideas';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';

const benefits = [
  {
    icon: Users,
    title: 'Collaborative Innovation',
    description: 'Connect with colleagues, share ideas, and build on each other\'s insights to create breakthrough solutions.'
  },
  {
    icon: Target,
    title: 'Impact Tracking',
    description: 'Monitor the implementation and impact of your ideas through our comprehensive tracking system.'
  },
  {
    icon: Bean,
    title: 'Recognition & Rewards',
    description: 'Earn beans for your contributions and redeem them for exciting rewards and opportunities.'
  },
  {
    icon: Zap,
    title: 'Quick Implementation',
    description: 'See your ideas come to life with our streamlined approval and implementation process.'
  }
];

const evaluationSteps = [
  {
    icon: ClipboardList,
    title: 'Idea Submission',
    description: 'Submit your innovative ideas through our platform',
    eta: 'Immediate acknowledgment',
    outcome: 'Ideas enter evaluation pipeline'
  },
  {
    icon: Brain,
    title: 'Evaluation',
    description: 'Ideas are assessed for feasibility and alignment with goals',
    eta: '7 working days',
    outcome: 'Clear decision and next steps'
  },
  {
    icon: Zap,
    title: 'Implementation',
    description: 'Approved ideas move to execution phase',
    eta: 'Based on scope',
    outcome: 'Successfully implemented ideas'
  },
  {
    icon: Presentation,
    title: 'Jury Review',
    description: 'Selected ideas presented for final review',
    eta: '2 weeks',
    outcome: 'Top ideas selected for recognition'
  },
  {
    icon: Medal,
    title: 'Recognition',
    description: 'Winners announced and celebrated',
    eta: 'Next monthly Townhall',
    outcome: 'Awards and recognition'
  }
];

export function HomePage() {
  const { data: ideas } = useIdeas();
  const { user } = useAuth();
  const isAdmin = user?.email?.endsWith('@kipi.ai');

  // Enhanced analytics for user ideas
  const userIdeas = ideas?.filter(idea => idea.author_id === user?.id) || [];
  
  const analytics = {
    total: userIdeas.length,
    approved: userIdeas.filter(idea => idea.status === 'approved').length,
    rejected: userIdeas.filter(idea => idea.status === 'rejected').length,
    pending: userIdeas.filter(idea => idea.status === 'pending').length,
    totalBeans: userIdeas.reduce((sum, idea) => sum + (idea.beans_earned || 0), 0),
    totalVotes: userIdeas.reduce((sum, idea) => sum + (idea.votes?.length || 0), 0),
    totalComments: userIdeas.reduce((sum, idea) => sum + (idea.comments?.length || 0), 0),
    categoryDistribution: userIdeas.reduce((acc: Record<string, number>, idea) => {
      acc[idea.category] = (acc[idea.category] || 0) + 1;
      return acc;
    }, {}),
    monthlySubmissions: userIdeas.reduce((acc: Record<string, number>, idea) => {
      const month = new Date(idea.created_at).toLocaleString('default', { month: 'long' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {})
  };

  const stats = [
    {
      name: 'Total Ideas',
      value: analytics.total,
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      subtext: 'ideas submitted by you'
    },
    {
      name: 'Ideas Approved',
      value: analytics.approved,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      subtext: 'of your ideas approved'
    },
    {
      name: 'Ideas Rejected',
      value: analytics.rejected,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      subtext: 'of your ideas rejected'
    },
    {
      name: 'Ideas Pending',
      value: analytics.pending,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      subtext: 'of your ideas pending'
    }
  ];

  const engagementStats = [
    {
      name: 'Total Beans',
      value: analytics.totalBeans,
      icon: Bean,
      color: 'from-yellow-500 to-yellow-600',
      subtext: 'beans earned from ideas'
    },
    {
      name: 'Total Votes',
      value: analytics.totalVotes,
      icon: ThumbsUp,
      color: 'from-indigo-500 to-indigo-600',
      subtext: 'votes on your ideas'
    },
    {
      name: 'Total Comments',
      value: analytics.totalComments,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      subtext: 'comments on your ideas'
    },
    {
      name: 'Avg. Beans per Idea',
      value: analytics.total ? (analytics.totalBeans / analytics.total).toFixed(1) : '0',
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      subtext: 'average beans per idea'
    }
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-float">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Transform Ideas into Impact
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {user ? (
              isAdmin ? 
                'Welcome back! Monitor and manage innovation across the organization ✨' :
                'Welcome back! Track your ideas and their impact ✨'
            ) : (
              'Join our community of innovators and shape the future together ✨'
            )}
          </p>
          {!isAdmin && (
            <Link
              to="/submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 hover:scale-105"
            >
              Share Your Idea
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>

        {/* Enhanced Analytics Section - Only show for non-admin logged-in users */}
        {user && !isAdmin && (
          <>
            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.name}
                    className="glass-effect gradient-border rounded-2xl p-6 card-hover transform transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="text-3xl font-bold gradient-text">
                            {stat.value}
                          </dd>
                          <dd className="text-sm text-gray-500 mt-1">
                            {stat.subtext}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {engagementStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.name}
                    className="glass-effect gradient-border rounded-2xl p-6 card-hover transform transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="text-3xl font-bold gradient-text">
                            {stat.value}
                          </dd>
                          <dd className="text-sm text-gray-500 mt-1">
                            {stat.subtext}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Evaluation Process Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
            Our Evaluation Process
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {evaluationSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="glass-effect rounded-2xl p-6 text-center transform transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="inline-flex items-center justify-center p-3 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {step.description}
                  </p>
                  <div className="text-sm">
                    <p className="text-indigo-600 font-medium">ETA: {step.eta}</p>
                    <p className="text-gray-500">Outcome: {step.outcome}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
            Why Use Kipi Innovate?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="glass-effect rounded-2xl p-6 text-center transform transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="inline-flex items-center justify-center p-3 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="glass-effect gradient-border rounded-2xl p-8 text-center">
            <div className="max-w-3xl mx-auto">
              <Sparkles className="h-12 w-12 text-indigo-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4 gradient-text">
                Ready to Make a Difference?
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Your ideas matter! Join our innovative community and help shape the future of our organization. 
                Start sharing your ideas today and earn recognition for your contributions. 
                🚀 Let's innovate together!
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 hover:scale-105"
              >
                Submit Your First Idea
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}