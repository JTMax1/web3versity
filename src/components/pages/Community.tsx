import React, { useState } from 'react';
import { Discussion } from '../../lib/mockData';
import { MessageSquare, ThumbsUp, Send, Users } from 'lucide-react';
import { Button } from '../ui/button';

interface CommunityProps {
  discussions: Discussion[];
}

export function Community({ discussions }: CommunityProps) {
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replyText, setReplyText] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
              <Users className="w-6 h-6 text-[#0084C7]" />
            </div>
            <div>
              <h1>Community Discussions</h1>
              <p className="text-gray-600">Ask questions and help fellow learners</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Discussions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="flex items-center justify-between mb-6">
                <h2>Recent Discussions</h2>
                <Button className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-full px-6 shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]">
                  New Discussion
                </Button>
              </div>

              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <DiscussionCard
                    key={discussion.id}
                    discussion={discussion}
                    onClick={() => setSelectedDiscussion(discussion)}
                    isSelected={selectedDiscussion?.id === discussion.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <h3 className="mb-4">Community Stats</h3>
              <div className="space-y-4">
                <StatItem label="Active Members" value="2,847" />
                <StatItem label="Total Discussions" value="1,234" />
                <StatItem label="Questions Answered" value="3,567" />
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <h3 className="mb-4">Top Contributors</h3>
              <div className="space-y-3">
                <ContributorItem avatar="🥷" name="BlockchainNinja" answers={234} />
                <ContributorItem avatar="👑" name="CryptoQueen" answers={189} />
                <ContributorItem avatar="🧙‍♂️" name="HashMaster" answers={156} />
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/10 rounded-3xl p-6 shadow-[0_4px_16px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <h3 className="mb-4">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#0084C7]">•</span>
                  <span>Be respectful and constructive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0084C7]">•</span>
                  <span>Search before posting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0084C7]">•</span>
                  <span>Provide clear examples</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0084C7]">•</span>
                  <span>Mark helpful answers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Discussion Detail Modal */}
        {selectedDiscussion && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedDiscussion(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-[0_24px_64px_rgba(0,0,0,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                      <span className="text-2xl">{selectedDiscussion.authorAvatar}</span>
                    </div>
                    <div>
                      <div className="text-gray-900">{selectedDiscussion.author}</div>
                      <div className="text-sm text-gray-600">{selectedDiscussion.timestamp}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDiscussion(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <h2 className="mb-2">{selectedDiscussion.title}</h2>
                <p className="text-gray-700">{selectedDiscussion.content}</p>
              </div>

              {/* Replies */}
              <div className="p-6">
                <h3 className="mb-4">{selectedDiscussion.replies} Replies</h3>
                <div className="space-y-4 mb-6">
                  <ReplyItem
                    avatar="💻"
                    author="SmartDev"
                    time="1 hour ago"
                    content="You need to associate the token with your account first using the Token Associate transaction. Here's a code example..."
                    upvotes={8}
                  />
                  <ReplyItem
                    avatar="🎓"
                    author="HelpfulMentor"
                    time="45 minutes ago"
                    content="Also make sure you have enough HBAR in your account to cover the transaction fee!"
                    upvotes={3}
                  />
                </div>

                {/* Reply Input */}
                <div className="border-t border-gray-200 pt-6">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_8px_rgba(0,132,199,0.15)] focus:outline-none focus:ring-2 focus:ring-[#0084C7]/20 transition-all resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end mt-4">
                    <Button className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-full px-6 shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]">
                      <Send className="w-4 h-4 mr-2" />
                      Post Reply
                    </Button>
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

function DiscussionCard({ 
  discussion, 
  onClick, 
  isSelected 
}: { 
  discussion: Discussion; 
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-2xl transition-all ${
        isSelected 
          ? 'bg-[#0084C7]/5 shadow-[inset_0_2px_8px_rgba(0,132,199,0.15)]' 
          : 'bg-gray-50 hover:bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
          <span className="text-xl">{discussion.authorAvatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="mb-1 line-clamp-2">{discussion.title}</h4>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{discussion.content}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{discussion.author}</span>
            <span>•</span>
            <span>{discussion.timestamp}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{discussion.replies}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{discussion.upvotes}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function ReplyItem({ avatar, author, time, content, upvotes }: { avatar: string; author: string; time: string; content: string; upvotes: number }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <span className="text-xl">{avatar}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-900">{author}</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{time}</span>
        </div>
        <p className="text-gray-700 mb-3">{content}</p>
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0084C7] transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span>{upvotes}</span>
        </button>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className="text-xl text-[#0084C7]">{value}</span>
    </div>
  );
}

function ContributorItem({ avatar, name, answers }: { avatar: string; name: string; answers: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <span>{avatar}</span>
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-900">{name}</div>
        <div className="text-xs text-gray-600">{answers} answers</div>
      </div>
    </div>
  );
}
