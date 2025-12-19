import React from 'react';
import { SystemNode, SystemType } from '../types';

interface SystemCardProps {
    system: SystemNode;
    isActive: boolean;
    connectionStatus?: 'source' | 'target' | null;
    isMilestoneMatch?: boolean; // New prop for milestone highlighting
    milestoneMode?: boolean;   // Are we in milestone mode?
    onClick: (system: SystemNode) => void;
    colorClass: string;
}

export const SystemCard: React.FC<SystemCardProps> = ({ 
    system, 
    isActive, 
    connectionStatus, 
    isMilestoneMatch,
    milestoneMode,
    onClick, 
    colorClass 
}) => {
    
    // Dynamic styling based on state and type
    const getBaseStyles = () => {
        // If in milestone mode and not a match, dim significantly
        if (milestoneMode && !isMilestoneMatch) {
            return 'bg-gray-50 border-gray-100 opacity-20 grayscale scale-95 z-0';
        }

        if (isActive) {
            return 'bg-blue-50 border-blue-500 ring-4 ring-blue-200 transform -translate-y-1 shadow-md z-30';
        }
        if (connectionStatus === 'source') {
             return 'bg-amber-50 border-amber-400 ring-2 ring-amber-100 shadow-sm z-20';
        }
        if (connectionStatus === 'target') {
             return 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-100 shadow-sm z-20';
        }
        
        // Default Active State (or matching milestone)
        return `bg-white border-gray-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 ${isActive || connectionStatus || (milestoneMode && isMilestoneMatch) ? '' : 'opacity-80 grayscale-[0.3]'}`;
    };

    const getTypeBadge = () => {
        if (system.type === SystemType.NEW) {
            return (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm z-10">
                    NEW
                </span>
            );
        }
        if (system.type === SystemType.CORE) {
             return (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm z-10">
                    CORE
                </span>
            );
        }
        return null;
    };

    const getBorderColor = () => {
        if (milestoneMode && !isMilestoneMatch) return 'border-gray-100';

        if (isActive) return 'border-blue-500';
        if (connectionStatus === 'source') return 'border-amber-400';
        if (connectionStatus === 'target') return 'border-emerald-400';

        if (system.type === SystemType.NEW) return 'border-emerald-200 bg-emerald-50/30';
        if (system.type === SystemType.CORE) return 'border-blue-200 bg-blue-50/30';
        return `border-gray-200`;
    };

    return (
        <button
            id={system.id}
            onClick={() => onClick(system)}
            className={`
                relative group flex flex-col items-center justify-center 
                p-3 rounded-lg border transition-all duration-500 cursor-pointer
                min-h-[70px] w-full
                ${getBaseStyles()}
                ${getBorderColor()}
                ${system.colSpan === 2 ? 'col-span-2' : 'col-span-1'}
            `}
        >
            {getTypeBadge()}
            
            <h4 className={`font-bold text-sm leading-tight text-slate-700 ${isActive ? 'text-blue-700' : ''}`}>
                {system.name}
            </h4>
            
            <span className="text-[10px] text-gray-500 mt-1 font-medium">
                {system.subLabel}
            </span>

            {/* Milestone Badge (Only visible in Milestone Mode or Hover) */}
            <div className={`
                absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-tighter
                ${milestoneMode && isMilestoneMatch ? 'bg-indigo-600 text-white opacity-100' : 'bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100'}
                transition-opacity duration-200
            `}>
                V{system.milestone}
            </div>

            {connectionStatus && (
                <div className={`absolute -bottom-2 px-2 py-0.5 text-[8px] rounded-full font-bold text-white uppercase tracking-wider shadow-sm
                    ${connectionStatus === 'source' ? 'bg-amber-400' : 'bg-emerald-400'}
                `}>
                    {connectionStatus === 'source' ? 'Source' : 'Dest'}
                </div>
            )}

            {/* Tooltip hint on hover */}
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full mb-2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap pointer-events-none z-20">
                點擊查看關聯 (V{system.milestone})
            </div>
        </button>
    );
};