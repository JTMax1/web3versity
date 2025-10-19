import React from 'react';
import { Button } from '../ui/button';
import { Sparkles, Rocket, Trophy, Code } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(0,132,199,0.15),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] mb-8">
            <Sparkles className="w-4 h-4 text-[#0084C7]" />
            <span className="text-sm">Hedera Africa Hackathon 2025</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-5xl md:text-6xl bg-gradient-to-r from-[#0084C7] to-[#00a8e8] bg-clip-text text-transparent">
            Learn Web3 on Hedera
          </h1>
          
          <p className="mb-12 text-xl text-gray-600 max-w-2xl mx-auto">
            Master blockchain development with interactive courses, hands-on coding, and real testnet transactions. Built for African developers and Web3 explorers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-full px-10 py-6 text-lg shadow-[0_8px_32px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.4),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105"
            >
              Start Learning Free
            </Button>
            <Button
              onClick={onGetStarted}
              className="bg-white text-[#0084C7] hover:bg-gray-50 rounded-full px-10 py-6 text-lg shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] transition-all duration-300"
            >
              View Courses
            </Button>
          </div>
        </div>

        {/* Floating Cards */}
        <div className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="🌐"
            title="Interactive Learning"
            description="Learn by doing with hands-on coding challenges and live blockchain transactions"
          />
          <FeatureCard
            icon="🎮"
            title="Gamified Experience"
            description="Earn points, unlock badges, and climb the leaderboard as you progress"
          />
          <FeatureCard
            icon="🚀"
            title="Real Testnet Access"
            description="Practice with actual Hedera testnet transactions and build real DApps"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-16 text-4xl text-gray-800">
            Two Learning Tracks
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Explorer Track */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-[0_12px_48px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_16px_64px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <span className="text-4xl">🧭</span>
              </div>
              <h3 className="mb-4 text-2xl text-green-900">Web3 Explorer</h3>
              <p className="text-green-700 mb-6">
                Perfect for beginners! Learn blockchain basics, wallet security, NFTs, and how to safely interact with DApps.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2),inset_1px_1px_4px_rgba(255,255,255,0.5)]">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-green-800">No coding required</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2),inset_1px_1px_4px_rgba(255,255,255,0.5)]">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-green-800">Wallet setup & security</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2),inset_1px_1px_4px_rgba(255,255,255,0.5)]">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-green-800">Understanding DeFi & NFTs</span>
                </li>
              </ul>
            </div>

            {/* Developer Track */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 shadow-[0_12px_48px_rgba(139,92,246,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_16px_64px_rgba(139,92,246,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <span className="text-4xl">💻</span>
              </div>
              <h3 className="mb-4 text-2xl text-purple-900">Developer</h3>
              <p className="text-purple-700 mb-6">
                Build on Hedera! Master smart contracts, token creation, consensus service, and full-stack DApp development.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2),inset_1px_1px_4px_rgba(255,255,255,0.5)]">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-purple-800">Hedera SDK & APIs</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2),inset_1px_1px_4px_rgba(255,255,255,0.5)]">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-purple-800">Smart contract development</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2),inset_1px_1px_4px_rgba(255,255,255,0.5)]">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-purple-800">Build production DApps</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-12 shadow-[0_12px_48px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="10,000+" label="Students" />
            <StatCard number="50+" label="Courses" />
            <StatCard number="1,000+" label="Certificates" />
            <StatCard number="24/7" label="Learning" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1">
      <div className="w-14 h-14 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-2xl flex items-center justify-center mb-4 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl bg-gradient-to-r from-[#0084C7] to-[#00a8e8] bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}
