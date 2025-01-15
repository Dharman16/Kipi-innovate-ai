import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  category: string;
  questions: {
    question: string;
    answer: string;
  }[];
}

const faqs: FAQ[] = [
  {
    category: 'General Questions',
    questions: [
      {
        question: 'What is Kipi Innovate?',
        answer: 'Kipi Innovate is a platform designed to foster innovation within our organization. It allows employees to submit ideas, collaborate with others, and earn recognition for their contributions to organizational improvement.'
      },
      {
        question: 'Why should I use Kipi Innovate?',
        answer: 'Using Kipi Innovate gives you the opportunity to share your innovative ideas, contribute to organizational growth, collaborate with colleagues, and earn rewards through our beans system.'
      }
    ]
  },
  {
    category: 'Idea Submission and Review',
    questions: [
      {
        question: 'How do I submit an idea?',
        answer: 'To submit an idea, navigate to the "My Ideas" section and click on the "Submit New Idea" button. Fill out the required information including title, description, and category, then submit for review.'
      },
      {
        question: 'What happens after I submit an idea?',
        answer: 'After submission, your idea goes through a review process by our evaluation team. You\'ll receive notifications about status changes and any feedback provided.'
      },
      {
        question: 'What criteria are used to evaluate ideas?',
        answer: 'Ideas are evaluated based on innovation, feasibility, potential impact, alignment with organizational goals, and resource requirements.'
      }
    ]
  },
  {
    category: 'Recognition and Rewards',
    questions: [
      {
        question: 'How are contributions recognized?',
        answer: 'Contributors earn beans for approved ideas and additional engagement. Top contributors are featured on the platform\'s leaderboard and receive special recognition.'
      },
      {
        question: 'What rewards can I redeem with Beans?',
        answer: 'Beans can be redeemed for various rewards including company merchandise, extra time off, learning resources, and other special perks.'
      }
    ]
  },
  {
    category: 'Implementation and Impact',
    questions: [
      {
        question: 'How is an idea implemented after approval?',
        answer: 'Approved ideas are assigned to relevant teams for implementation. The original contributor is often involved in the implementation process and can track progress.'
      },
      {
        question: 'How is the impact of an implemented idea assessed?',
        answer: 'We track various metrics depending on the idea type, including cost savings, efficiency improvements, user satisfaction, and other relevant KPIs.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        question: 'Who do I contact if I face issues on the platform?',
        answer: 'For technical support, please reach out to our support team through the Contact page or email support@kipi-innovate.com.'
      },
      {
        question: 'Can I edit my idea after submission?',
        answer: 'Yes, you can edit your idea while it\'s in "Pending" status. Once the review process begins, you\'ll need to contact support for any necessary changes.'
      }
    ]
  }
];

export function FAQPage() {
  const [openCategories, setOpenCategories] = useState<string[]>([faqs[0].category]);
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleQuestion = (question: string) => {
    setOpenQuestions(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-gray-600">
            Find answers to common questions about using Kipi Innovate
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((category) => (
            <div
              key={category.category}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleCategory(category.category)}
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  {category.category}
                </h2>
                {openCategories.includes(category.category) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {openCategories.includes(category.category) && (
                <div className="divide-y divide-gray-200">
                  {category.questions.map((faq) => (
                    <div key={faq.question} className="px-6">
                      <button
                        className="w-full py-4 flex items-center justify-between text-left"
                        onClick={() => toggleQuestion(faq.question)}
                      >
                        <h3 className="text-base font-medium text-gray-900">
                          {faq.question}
                        </h3>
                        {openQuestions.includes(faq.question) ? (
                          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {openQuestions.includes(faq.question) && (
                        <div className="pb-4">
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}