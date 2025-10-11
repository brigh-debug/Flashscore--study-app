import React from "react";
import ComponentTile from "./ComponentTile";

interface Component {
  name: string;
  type: 'ai' | 'prediction' | 'community' | 'crypto' | 'security';
  powerBoost: number;
  installed: boolean;
}

interface PhaseCardProps {
  phase: {
    id: string;
    name: string;
    description: string;
    requiredPower: number;
    unlocked: boolean;
    building: boolean;
    completed: boolean;
    components: Component[];
  };
  currentPhase: string;
  isBuilding: boolean;
  startBuilding: (phaseId: string) => void;
}

export default function PhaseCard({ phase, currentPhase, isBuilding, startBuilding }: PhaseCardProps) {
  return (
    <div className={`
      relative bg-gray-800 rounded-lg p-6 border-2 transition-all duration-300
      ${phase.completed ? 'border-green-500 bg-green-900/20' : 
        phase.unlocked ? 'border-blue-500 hover:border-yellow-500' : 
        'border-gray-600 opacity-50