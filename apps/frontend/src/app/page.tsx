"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Core Hook (1)
import LiveMatches from "@/components/LiveMatches";

// 5 Supporting Pillars
import QuickStats from "@/components/QuickStats";       // 📊
import Analytics from "@/components/Analytics";         // 📈
import Predictions from "@/components/Predictions";     // 🔮
import NewsFeed from "@/components/NewsFeed";           // 📰
import EngagementTools from "@/components/Engagement";  // 📱 (PWA, Drawer, etc)

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"live" | "analytics">("live");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      
      {/* 🔝 Navbar */}
      <header className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-bold">Sports Central</h1>
        <EngagementTools />
      </header>

      {/* 🔄 Tab Switcher */}
      <nav className="flex justify-center gap-4 mt-2">
        <button
          className={`px-4 py-2 rounded-xl ${
            activeTab === "live" ? "bg-green-600" : "bg-gray-800"
          }`}
          onClick={() => setActiveTab("live")}
        >
          ⚽ Live Matches
        </button>
        <button
          className={`px-4 py-2 rounded-xl ${
            activeTab === "analytics" ? "bg-green-600" : "bg-gray-800"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          📈 Analytics
        </button>
      </nav>

      {/* 🏆 ONE Core Hook */}
      <main className="flex-1 p-4 grid lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2">
          {activeTab === "live" ? (
            <LiveMatches /> // CORE FEATURE
          ) : (
            <Analytics />
          )}
        </section>

        {/* 🌐 FIVE Supporting Elements */}
        <aside className="space-y-4">
          <QuickStats />      {/* 📊 Stats / Streaks */}
          <Predictions />     {/* 🔮 Predictions */}
          <NewsFeed />        {/* 📰 News */}
          <EngagementTools /> {/* 📱 PWA, Drawer */}
        </aside>
      </main>
    </div>
  );
}