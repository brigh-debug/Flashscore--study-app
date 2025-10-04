// ============================================
// 1. SETUP: Create .env.local file in root
// ============================================
// NEXT_PUBLIC_ODDS_API_KEY=your_api_key_here
// Get free API key from: https://the-odds-api.com/

// ============================================
// 2. API ROUTE: app/api/odds/route.ts
// ============================================
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'soccer_epl';

  const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/${sport}/odds/?` +
      `apiKey=${apiKey}&` +
      `regions=us,uk,eu&` +
      `markets=h2h&` +
      `oddsFormat=decimal`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );

    if (!response.ok) {
      throw new Error('Failed to fetch odds');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch odds data' },
      { status: 500 }
    );
  }
}

// ============================================
// 3. TYPES: types/odds.ts
// ============================================
export interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

export interface Market {
  key: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
}

export interface Match {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

// ============================================
// 4. MAIN COMPONENT: app/odds/page.tsx
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { Match } from '@/types/odds';

export default function LiveOddsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState('soccer_epl');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const sports = [
    { key: 'soccer_epl', name: 'Premier League' },
    { key: 'soccer_spain_la_liga', name: 'La Liga' },
    { key: 'soccer_germany_bundesliga', name: 'Bundesliga' },
    { key: 'soccer_italy_serie_a', name: 'Serie A' },
    { key: 'soccer_uefa_champs_league', name: 'Champions League' },
  ];

  const fetchOdds = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/odds?sport=${selectedSport}`);

      if (!response.ok) {
        throw new Error('Failed to fetch odds');
      }

      const data = await response.json();
      setMatches(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOdds();

    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchOdds, 120000);

    return () => clearInterval(interval);
  }, [selectedSport]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getTeamInitials = (teamName: string) => {
    return teamName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <header className="bg-black p-4 border-b-4 border-[#ff6b4a] sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold tracking-widest">LIVE ODDS</h1>
          <button 
            onClick={fetchOdds}
            className="px-4 py-2 bg-[#ff6b4a] rounded-lg hover:bg-[#ff5030] transition"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Sport Selector */}
      <div className="bg-[#2a2a2a] p-4 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {sports.map(sport => (
              <button
                key={sport.key}
                onClick={() => setSelectedSport(sport.key)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedSport === sport.key
                    ? 'bg-[#ff6b4a] text-white'
                    : 'bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]'
                }`}
              >
                {sport.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center text-sm text-gray-400 py-2">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-[#ff6b4a] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading odds...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchOdds}
              className="mt-4 px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl">No matches available</p>
            <p className="mt-2">Try selecting a different league</p>
          </div>
        )}

        {!loading && !error && matches.map((match) => (
          <div key={match.id} className="mb-8">
            <h2 className="text-center text-lg text-gray-400 mb-4">
              {match.sport_title}
            </h2>

            <div className="bg-[#2a2a2a] rounded-xl p-6">
              {/* Match Header */}
              <div className="flex justify-around items-center mb-6">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-sm font-bold mb-2">
                    {getTeamInitials(match.home_team)}
                  </div>
                  <div className="text-sm font-bold text-center">
                    {match.home_team}
                  </div>
                </div>

                <div className="flex-1 text-center px-4">
                  <div className="text-sm text-gray-400 mb-1">
                    {formatDate(match.commence_time)}
                  </div>
                  <div className="text-2xl font-bold">
                    {formatTime(match.commence_time)}
                  </div>
                </div>

                <div className="flex flex-col items-center flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-sm font-bold mb-2">
                    {getTeamInitials(match.away_team)}
                  </div>
                  <div className="text-sm font-bold text-center">
                    {match.away_team}
                  </div>
                </div>
              </div>

              {/* Odds Section */}
              {match.bookmakers.length > 0 ? (
                <div className="mt-6">
                  <div className="flex justify-around py-3 border-b border-gray-700 mb-3">
                    <span className="flex-1 text-center text-sm text-gray-400">
                      Home
                    </span>
                    <span className="flex-1 text-center text-sm text-gray-400">
                      Draw
                    </span>
                    <span className="flex-1 text-center text-sm text-gray-400">
                      Away
                    </span>
                  </div>

                  {match.bookmakers.slice(0, 3).map((bookmaker) => {
                    const market = bookmaker.markets[0];
                    const homeOdds = market.outcomes.find(
                      o => o.name === match.home_team
                    );
                    const awayOdds = market.outcomes.find(
                      o => o.name === match.away_team
                    );
                    const drawOdds = market.outcomes.find(
                      o => o.name === 'Draw'
                    );

                    return (
                      <div 
                        key={bookmaker.key} 
                        className="flex items-center py-3 border-b border-gray-700 last:border-b-0"
                      >
                        <div className="w-24 py-2 px-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-md text-center text-xs mr-3 truncate">
                          {bookmaker.title}
                        </div>
                        <button className="flex-1 text-center text-lg font-semibold py-2 rounded-md hover:bg-[#3a3a3a] transition">
                          {homeOdds?.price.toFixed(2) || '-'}
                        </button>
                        <button className="flex-1 text-center text-lg font-semibold py-2 rounded-md hover:bg-[#3a3a3a] transition">
                          {drawOdds?.price.toFixed(2) || '-'}
                        </button>
                        <button className="flex-1 text-center text-lg font-semibold py-2 rounded-md hover:bg-[#3a3a3a] transition">
                          {awayOdds?.price.toFixed(2) || '-'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">
                  No odds available
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 5. ALTERNATIVE: Using a Mock API for Testing
// ============================================
// If you don't have an API key yet, replace the API route with this:

/*
export async function GET(request: Request) {
  // Mock data for testing
  const mockData = [
    {
      id: '1',
      sport_key: 'soccer_epl',
      sport_title: 'Premier League',
      commence_time: new Date(Date.now() + 86400000).toISOString(),
      home_team: 'Manchester United',
      away_team: 'Liverpool',
      bookmakers: [
        {
          key: 'betking',
          title: 'Betking',
          markets: [{
            key: 'h2h',
            outcomes: [
              { name: 'Manchester United', price: 2.10 },
              { name: 'Draw', price: 3.40 },
              { name: 'Liverpool', price: 3.20 }
            ]
          }]
        },
        {
          key: '1xbet',
          title: '1XBET',
          markets: [{
            key: 'h2h',
            outcomes: [
              { name: 'Manchester United', price: 2.05 },
              { name: 'Draw', price: 3.45 },
              { name: 'Liverpool', price: 3.25 }
            ]
          }]
        }
      ]
    }
  ];

  return NextResponse.json(mockData);
}
*/