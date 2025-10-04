// apps/frontend/src/app/page.tsx
"use client";
import React, { useState } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import PWAInstaller from "./components/PWAInstaller";
import Navbar from "./components/NavBar";

const AdvancedAnalytics = dynamic(() => import('@/components/AdvancedAnalytics'), {
  ssr: false,
  loading: () => <div className="loading-skeleton">Loading analytics...</div>
});

const LiveMatchProbabilityTracker = dynamic(() => import('./components/LiveMatchProbabilityTracker'), {
  ssr: false,
  loading: () => <div className="loading-skeleton">Loading live tracker...</div>
});

const IOSInterface = dynamic(() => import('./components/iOSInterface'), {
  ssr: false
});

const AppDrawer = dynamic(() => import('./components/AppDrawer'), {
  ssr: false
});

const EchoSystem = dynamic(() => import('./components/EchoSystem'), {
  ssr: false
});

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [selectedSport, setSelectedSport] = useState<string>('all');

  const sports = [
    { id: 'all', name: 'All Sports', icon: '⚽' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
  ];

  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'odds' | 'finished' | 'scheduled'>('all');

  const matchFilters = [
    { id: 'all', label: 'ALL', count: 12 },
    { id: 'live', label: 'LIVE', count: 3 },
    { id: 'odds', label: 'ODDS', count: 8 },
    { id: 'finished', label: 'FINISHED', count: 5 },
    { id: 'scheduled', label: 'SCHEDULED', count: 4 },
  ];

  const dashboardStats = [
    { label: 'Active Users', value: '2,341', change: '+12.5%', icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Predictions Today', value: '847', change: '+8.3%', icon: '🎯', color: 'from-purple-500 to-purple-600', link: '/predictions' },
    { label: 'Accuracy Rate', value: '78.5%', change: '+2.1%', icon: '📈', color: 'from-green-500 to-green-600' },
    { label: 'Pi Coins Earned', value: '3,420', change: '+420', icon: '💰', color: 'from-yellow-500 to-yellow-600' },
  ];

  const pinnedLeagues = [
    { name: 'Premier League', country: 'England', flag: '🏴󐁧󐁢󐁥󐁮󐁧󐁿', active: 3 },
    { name: 'La Liga', country: 'Spain', flag: '🇪🇸', active: 2 },
    { name: 'Serie A', country: 'Italy', flag: '🇮🇹', active: 1 },
    { name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', active: 2 },
    { name: 'Ligue 1', country: 'France', flag: '🇫🇷', active: 0 },
  ];
  const liveMatches = [
    { 
      league: 'Premier League', 
      country: 'England',
      homeTeam: 'Manchester United', 
      awayTeam: 'Liverpool', 
      homeScore: 2, 
      awayScore: 1, 
      time: "67'",
      status: 'live'
    },
    { 
      league: 'La Liga', 
      country: 'Spain',
      homeTeam: 'Real Madrid', 
      awayTeam: 'Barcelona', 
      homeScore: 0, 
      awayScore: 0, 
      time: "12'",
      status: 'live'
    },
    { 
      league: 'Serie A', 
      country: 'Italy',
      homeTeam: 'AC Milan', 
      awayTeam: 'Inter Milan', 
      homeScore: 1, 
      awayScore: 1, 
      time: "HT",
      status: 'halftime'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation Bar */}
      <Navbar />
      
      {/* Header with Glassmorphism */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Live Score
              </h1>
              <div className="flex gap-2 overflow-x-auto">
                {sports.map(sport => (
                  <button
                    key={sport.id}
                    onClick={() => setSelectedSport(sport.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 whitespace-nowrap ${
                      selectedSport === sport.id 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {sport.icon} {sport.name}
                  </button>
                ))}
              </div>
            </div>
            <PWAInstaller />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 text-sm font-bold uppercase relative transition-all ${
                activeTab === 'overview' 
                  ? 'text-cyan-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs rounded-full shadow-lg">
                {liveMatches.length}
              </span>
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 text-sm font-bold uppercase relative transition-all ${
                activeTab === 'analytics' 
                  ? 'text-cyan-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Analytics
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4">
            
            {activeTab === 'overview' && (
              <>
                {/* Dashboard Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {dashboardStats.map((stat, idx) => (
                    <div 
                      key={idx} 
                      className="group cursor-pointer"
                      onClick={() => stat.link && router.push(stat.link)}
                    >
                      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{stat.icon}</span>
                          <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                            {stat.change}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Matches */}
                <div className="space-y-3">
                  {liveMatches.map((match, idx) => (
                    <div key={idx} className="group">
                      {/* League Header */}
                      <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl px-4 py-2 flex items-center gap-2 text-xs rounded-t-xl border border-white/10">
                        <span className="text-gray-400">{match.country}:</span>
                        <span className="text-white font-bold">{match.league}</span>
                      </div>
                      
                      {/* Match Row */}
                      <div className="bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer rounded-b-xl border-x border-b border-white/10 group-hover:border-cyan-500/30 group-hover:shadow-lg group-hover:shadow-cyan-500/10">
                        <div className="px-4 py-4 grid grid-cols-12 gap-3 items-center">
                          {/* Time/Status */}
                          <div className="col-span-2 text-center">
                            <div className={`text-sm font-bold px-3 py-1 rounded-lg ${
                              match.status === 'live' 
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white animate-pulse' 
                                : 'bg-white/10 text-gray-400'
                            }`}>
                              {match.time}
                            </div>
                          </div>
                          
                          {/* Teams */}
                          <div className="col-span-7 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white font-medium">{match.homeTeam}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white font-medium">{match.awayTeam}</span>
                            </div>
                          </div>
                          
                          {/* Score */}
                          <div className="col-span-2 space-y-2">
                            <div className="text-right">
                              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                {match.homeScore}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                {match.awayScore}
                              </span>
                            </div>
                          </div>
                          
                          {/* Arrow */}
                          <div className="col-span-1 text-right text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xl">›</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <AdvancedAnalytics />
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Live Tracker */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all">
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Live Tracker</h3>
              </div>
              <div className="p-4">
                <LiveMatchProbabilityTracker />
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Quick Access</h3>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={() => router.push('/predictions')}
                  className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <div className="text-sm font-bold text-white">Predictions</div>
                        <div className="text-xs text-gray-400">View all predictions</div>
                      </div>
                    </div>
                    <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/news')}
                  className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📰</span>
                      <div>
                        <div className="text-sm font-bold text-white">News</div>
                        <div className="text-xs text-gray-400">Latest sports news</div>
                      </div>
                    </div>
                    <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Components */}
      <IOSInterface />
      <AppDrawer />
      <EchoSystem />
    </div>
  );
}