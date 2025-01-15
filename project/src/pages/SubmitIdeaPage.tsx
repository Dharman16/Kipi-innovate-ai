import React, { useState, useEffect } from 'react';
import { X, Plus, Send, Loader2, ShieldAlert, User, Link as LinkIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { useCreateIdea } from '../lib/api/ideas';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ResourceLink {
  id: string;
  url: string;
  title: string;
}

interface Contributor {
  id: string;
  full_name: string;
  email: string;
}

interface IdeaFormData {
  title: string;
  category: string;
  description: string;
  resourceLinks: ResourceLink[];
  contributors: Contributor[];
}

const categories = [
  'Lammas - Accelerator & Native Apps',
  'Technology COE - Reusable Assets/Enablers',
  'Delivery - Process Improvement',
  'Industry Solutions - Domain Expertise & Business Use Cases',
  'Data Science',
  'Learning & Development',
  'Sales & Marketing',
  'Operations, HR, CSM, ESM, etc.',
] as const;

export function SubmitIdeaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutate: createIdea, isLoading } = useCreateIdea();
  const isAdmin = user?.email?.endsWith('@kipi.ai');
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    category: '',
    description: '',
    resourceLinks: [],
    contributors: [],
  });

  const [error, setError] = useState<string | null>(null);
  const [contributorEmail, setContributorEmail] = useState('');
  const [contributorSearchResults, setContributorSearchResults] = useState<Contributor[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Redirect admins away from the submission page
  useEffect(() => {
    if (isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // If user is admin, show access denied message
  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-4">
            Administrators cannot submit ideas. Please use a regular user account.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const searchContributors = async (email: string) => {
    if (!email.trim()) {
      setContributorSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .ilike('email', `%${email}%`)
        .limit(5);

      if (error) throw error;
      setContributorSearchResults(data || []);
    } catch (err) {
      console.error('Error searching contributors:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleContributorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setContributorEmail(email);
    searchContributors(email);
  };

  const addContributor = (contributor: Contributor) => {
    if (!formData.contributors.some(c => c.id === contributor.id)) {
      setFormData(prev => ({
        ...prev,
        contributors: [...prev.contributors, contributor],
      }));
    }
    setContributorEmail('');
    setContributorSearchResults([]);
  };

  const removeContributor = (id: string) => {
    setFormData(prev => ({
      ...prev,
      contributors: prev.contributors.filter(c => c.id !== id),
    }));
  };

  const addResourceLink = () => {
    if (newLinkUrl.trim() && newLinkTitle.trim()) {
      const newLink: ResourceLink = {
        id: crypto.randomUUID(),
        url: newLinkUrl.trim(),
        title: newLinkTitle.trim()
      };

      setFormData(prev => ({
        ...prev,
        resourceLinks: [...prev.resourceLinks, newLink]
      }));

      setNewLinkUrl('');
      setNewLinkTitle('');
    }
  };

  const removeResourceLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      resourceLinks: prev.resourceLinks.filter(link => link.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setError(null);

      // Create the idea
      await createIdea({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        author_id: user.id,
        status: 'pending',
        resource_links: formData.resourceLinks
      }, {
        onSuccess: async (idea) => {
          // Add contributors
          if (formData.contributors.length > 0) {
            await Promise.all(
              formData.contributors.map(async (contributor) => {
                const { error } = await supabase
                  .from('idea_contributors')
                  .insert({
                    idea_id: idea.id,
                    user_id: contributor.id
                  });
                if (error) throw error;
              })
            );
          }

          navigate('/my-ideas');
        }
      });
    } catch (err) {
      console.error('Error submitting idea:', err);
      setError('Failed to submit idea. Please try again.');
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Your Idea</h1>
          <p className="mt-2 text-lg text-gray-600">
            Share your innovative ideas with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
              Idea Title
            </label>
            <input
              type="text"
              id="title"
              required
              placeholder="Enter your idea title here"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
              Idea Category
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
              Idea Description
            </label>
            <textarea
              id="description"
              required
              rows={6}
              placeholder="Provide a detailed description of your idea"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Resource Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resource Links
            </label>
            <div className="mt-1 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={e => setNewLinkTitle(e.target.value)}
                    placeholder="Link title"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addResourceLink}
                  disabled={!newLinkUrl.trim() || !newLinkTitle.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {formData.resourceLinks.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Added Links:</h4>
                  <div className="space-y-2">
                    {formData.resourceLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between bg-gray-50 rounded-md p-2"
                      >
                        <div className="flex items-center">
                          <LinkIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{link.title}</p>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-500"
                            >
                              {link.url}
                            </a>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeResourceLink(link.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contributors */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contributors
            </label>
            <div className="mt-1 space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={contributorEmail}
                  onChange={handleContributorSearch}
                  placeholder="Search contributors by email"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                )}
                {contributorSearchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
                    {contributorSearchResults.map((contributor) => (
                      <button
                        key={contributor.id}
                        type="button"
                        onClick={() => addContributor(contributor)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 flex items-center"
                      >
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <p className="font-medium">{contributor.full_name || 'Unnamed User'}</p>
                          <p className="text-gray-500">{contributor.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {formData.contributors.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Added Contributors:</h4>
                  <div className="space-y-2">
                    {formData.contributors.map((contributor) => (
                      <div
                        key={contributor.id}
                        className="flex items-center justify-between bg-gray-50 rounded-md p-2"
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contributor.full_name || 'Unnamed User'}
                            </p>
                            <p className="text-xs text-gray-500">{contributor.email}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeContributor(contributor.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
                "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                isLoading && "opacity-75 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Idea
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}