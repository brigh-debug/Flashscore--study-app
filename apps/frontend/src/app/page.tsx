// apps/frontend/src/app/page.tsx
"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import HorizontalCarousel from "./components/HorizontalCarousel";
import PWAInstaller from "./components/PWAInstaller";
import Navbar from "./components/NavBar";
import IOSInterface from "./components/iOSInterface";
import AppDrawer from "./components/AppDrawer";
import EchoSystem from "./components/EchoSystem";

const AdvancedAnalytics = dynamic(
  () => import("./components/AdvancedAnalytics"),
  {
    ssr: false,
    loading: () => <div className="loading-skeleton">Loading analytics...</div>,
  },
);

const LiveMatchProbabilityTracker = dynamic(
  () => import("./components/LiveMatchProbabilityTracker"),
  {
    ssr: false,
    loading: () => (
      <div className="loading-skeleton">Loading live tracker...</div>
    ),
  },
);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"live" | "finished" | "scheduled">(
    "live",
  );
  const [selectedSport, setSelectedSport] = useState<string>("all");

  const sports = [
    { id: "all", name: "ALL", icon: "⚽" },
    { id: "football", name: "FOOTBALL", icon: "⚽" },
    { id: "basketball", name: "BASKETBALL", icon: "🏀" },
    { id: "tennis", name: "TENNIS", icon: "🎾" },
    { id: "cricket", name: "CRICKET", icon: "🏏" },
  ];

  const liveMatches = [
    {
      league: "Premier League",
      country: "England",
      homeTeam: "Manchester United",
      awayTeam: "Liverpool",
      homeScore: 2,
      awayScore: 1,
      time: "67'",
      status: "live",
    },
    {
      league: "La Liga",
      country: "Spain",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      homeScore: 0,
      awayScore: 0,
      time: "12'",
      status: "live",
    },
    {
      league: "Serie A",
      country: "Italy",
      homeTeam: "AC Milan",
      awayTeam: "Inter Milan",
      homeScore: 1,
      awayScore: 1,
      time: "HT",
      status: "halftime",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* FlashScore-style Header */}
      <div className="bg-[#222] border-b border-[#333]">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-[#f4a11d]">LIVESCORE</h1>
              <div className="flex gap-1">
                {sports.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => setSelectedSport(sport.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                      selectedSport === sport.id
                        ? "bg-[#f4a11d] text-black"
                        : "bg-[#2a2a2a] text-gray-400 hover:bg-[#333]"
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

      {/* Match Tabs */}
      <div className="bg-[#1e1e1e] border-b border-[#333]">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex gap-6">
            {["live", "finished", "scheduled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 text-sm font-semibold uppercase relative ${
                  activeTab === tab
                    ? "text-[#f4a11d]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f4a11d]" />
                )}
                {tab === "live" && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded">
                    {liveMatches.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Matches List */}
          <div className="lg:col-span-2 space-y-4">
            {activeTab === "live" && (
              <div className="space-y-2">
                {liveMatches.map((match, idx) => (
                  <div key={idx}>
                    {/* League Header */}
                    <div className="bg-[#252525] px-3 py-2 flex items-center gap-2 text-xs">
                      <span className="text-gray-400">{match.country}:</span>
                      <span className="text-white font-semibold">
                        {match.league}
                      </span>
                    </div>

                    {/* Match Row */}
                    <div className="bg-[#2a2a2a] hover:bg-[#303030] transition-colors cursor-pointer">
                      <div className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center">
                        {/* Time/Status */}
                        <div className="col-span-2 text-center">
                          <div
                            className={`text-sm font-bold ${
                              match.status === "live"
                                ? "text-[#f4a11d]"
                                : "text-gray-400"
                            }`}
                          >
                            {match.time}
                          </div>
                        </div>

                        {/* Teams */}
                        <div className="col-span-7 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white">
                              {match.homeTeam}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white">
                              {match.awayTeam}
                            </span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="col-span-2 space-y-1">
                          <div className="text-right">
                            <span className="text-lg font-bold text-white">
                              {match.homeScore}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-white">
                              {match.awayScore}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="col-span-1 text-right text-gray-500">
                          <span>›</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <AdvancedAnalytics />
              </div>
            )}

            {activeTab === "scheduled" && (
              <div className="bg-[#2a2a2a] rounded-lg p-6 text-center text-gray-400">
                <p>Scheduled matches will appear here</p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Live Tracker */}
            <div className="bg-[#2a2a2a] rounded-lg overflow-hidden">
              <div className="bg-[#252525] px-3 py-2 border-b border-[#333]">
                <h3 className="text-sm font-semibold text-white">
                  LIVE TRACKER
                </h3>
              </div>
              <div className="p-3">
                <LiveMatchProbabilityTracker />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#2a2a2a] rounded-lg overflow-hidden">
              <div className="bg-[#252525] px-3 py-2 border-b border-[#333]">
                <h3 className="text-sm font-semibold text-white">
                  TODAY'S STATS
                </h3>
              </div>
              <div className="p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Matches</span>
                  <span className="text-base font-bold text-[#f4a11d]">
                    847
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Accuracy</span>
                  <span className="text-base font-bold text-green-500">
                    78.5%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Pi Coins</span>
                  <span className="text-base font-bold text-yellow-500">
                    3,420
                  </span>
                </div>
              </div>
            </div>

            {/* Carousel */}
            <div className="bg-[#2a2a2a] rounded-lg overflow-hidden">
              <HorizontalCarousel />
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
