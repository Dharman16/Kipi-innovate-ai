import React, { useState } from 'react';
import { useIdeas, useEditIdea } from '../../lib/api/ideas';
import { useAwardBeans, useBeanAwards } from '../../lib/api/beans';
import { useAuth } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye, 
  EyeOff,
  History,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  User,
  Calendar,
  Tag,
  Link as LinkIcon,
  Users,
  FileText,
  Clock,
  Search,
  Filter,
  SlidersHorizontal,
  Lightbulb,
  FileCheck,
  FileX,
  Medal,
  Star,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Info,
  Trash2,
  Edit,
  MoreHorizontal,
  Sparkles,
  BrainCircuit
} from 'lucide-react';

export function IdeaManagement() {
  const { user } = useAuth();
  const { data: ideas, isLoading } = useIdeas();
  const { mutate: editIdea } = useEditIdea();
  const { mutate: awardBeans } = useAwardBeans();
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);
  const [beansAmount, setBeansAmount] = useState<number>(0);
  const [awardNote, setAwardNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { data: beanAwards } = useBeanAwards(selectedIdea?.id);
  const [statusNote, setStatusNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState<{
    ideaId: string;
    status: 'approved' | 'rejected';
  } | null>(null);
  const [viewingIdea, setViewingIdea] = useState<any | null>(null);

  const handleStatusChange = async (ideaId: string, status: 'approved' | 'rejected', note: string) => {
    if (!user) return;

    if (!note.trim()) {
      alert('Please provide a note for the status change.');
      return;
    }

    await editIdea({
      id: ideaId,
      updates: {
        status,
        feedback: note,
        feedback_by: user.id,
        feedback_at: new Date().toISOString()
      },
      editorId: user.id
    });

    setShowStatusModal(null);
    setStatusNote('');
  };

  const handleVisibilityToggle = async (ideaId: string, hidden: boolean) => {
    if (!user) return;

    await editIdea({
      id: ideaId,
      updates: { hidden },
      editorId: user.id
    });
  };

  const handleBeansAward = async () => {
    if (!user || !selectedIdea) return;

    if (beansAmount <= 0) {
      alert('Please enter a valid number of beans.');
      return;
    }

    if (!awardNote.trim()) {
      alert('Please provide a note for the beans award.');
      return;
    }

    await awardBeans({
      idea_id: selectedIdea.id,
      awarded_by: user.id,
      beans_amount: beansAmount,
      note: awardNote.trim()
    });

    setBeansAmount(0);
    setAwardNote('');
    setSelectedIdea(null);
  };

  const handleViewIdea = (idea: any) => {
    setViewingIdea(idea);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Idea Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beans
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ideas?.map((idea) => (
                  <tr key={idea.id} className={cn(idea.hidden && "bg-gray-50")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleViewIdea(idea)}
                          className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {idea.title}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{idea.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        idea.status === 'approved' && "bg-green-100 text-green-800",
                        idea.status === 'rejected' && "bg-red-100 text-red-800",
                        idea.status === 'pending' && "bg-yellow-100 text-yellow-800"
                      )}>
                        {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{idea.beans_earned || 0}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      {idea.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setShowStatusModal({ ideaId: idea.id, status: 'approved' })}
                            className="text-green-600 hover:text-green-900"
                            title="Approve Idea"
                          >
                            <FileCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowStatusModal({ ideaId: idea.id, status: 'rejected' })}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Idea"
                          >
                            <FileX className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedIdea(idea)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Award Beans"
                      >
                        <Medal className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleVisibilityToggle(idea.id, !idea.hidden)}
                        className={cn(
                          "hover:text-gray-900",
                          idea.hidden ? "text-red-600" : "text-gray-600"
                        )}
                        title={idea.hidden ? "Show Idea" : "Hide Idea"}
                      >
                        {idea.hidden ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleViewIdea(idea)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showStatusModal.status === 'approved' ? 'Approve' : 'Reject'} Idea
                </h2>
                <button
                  onClick={() => {
                    setShowStatusModal(null);
                    setStatusNote('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Feedback Note (Required)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={`Explain why you're ${showStatusModal.status === 'approved' ? 'approving' : 'rejecting'} this idea...`}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowStatusModal(null);
                      setStatusNote('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusChange(showStatusModal.ideaId, showStatusModal.status, statusNote)}
                    className={cn(
                      "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
                      showStatusModal.status === 'approved'
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    )}
                  >
                    {showStatusModal.status === 'approved' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Award Beans Modal */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Award Beans</h2>
                  <p className="mt-1 text-sm text-gray-500">{selectedIdea.title}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedIdea(null);
                    setShowHistory(false);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    <History className="h-4 w-4 mr-1" />
                    {showHistory ? 'Hide History' : 'Show History'}
                  </button>
                </div>

                {showHistory && beanAwards && beanAwards.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Award History</h3>
                    <div className="space-y-3">
                      {beanAwards.map((award) => (
                        <div key={award.id} className="text-sm">
                          <div className="flex justify-between text-gray-500">
                            <span>{award.awarded_by.full_name || 'Anonymous'}</span>
                            <span>{new Date(award.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-yellow-600 mt-1">
                            <Award className="h-4 w-4 mr-1" />
                            {award.beans_amount} beans
                          </div>
                          <p className="text-gray-600 mt-1">{award.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Beans
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={beansAmount}
                    onChange={(e) => setBeansAmount(parseInt(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Note
                  </label>
                  <textarea
                    value={awardNote}
                    onChange={(e) => setAwardNote(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Explain why you're awarding these beans..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedIdea(null);
                      setShowHistory(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBeansAward}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Award Beans
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Idea Details Modal */}
      {viewingIdea && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{viewingIdea.title}</h2>
                <button
                  onClick={() => setViewingIdea(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{viewingIdea.description}</p>
                </div>

                {viewingIdea.feedback && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Feedback</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                            <User className="h-3 w-3 text-indigo-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {viewingIdea.feedback_by?.full_name || 'Anonymous Admin'}
                            </span>
                            {viewingIdea.feedback_at && (
                              <span className="text-sm text-gray-500 ml-2">
                                on {new Date(viewingIdea.feedback_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">{viewingIdea.feedback}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Details</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="mt-1 text-sm text-gray-900">{viewingIdea.category}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">{viewingIdea.status}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">Submitted By</dt>
                      <dd className="mt-1 text-sm text-gray-900">{viewingIdea.author?.full_name || 'Anonymous'}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{new Date(viewingIdea.created_at).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}