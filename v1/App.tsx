import React, { useState, useCallback, useLayoutEffect, useRef } from 'react';
import { ARCHITECTURE_DATA } from './constants';
import { SystemNode, AirportMilestone } from './types';
import { SystemCard } from './components/SystemCard';
import { ChatWidget } from './components/ChatWidget';

// Flatten the system nodes for easier lookup
const ALL_SYSTEMS = ARCHITECTURE_DATA.flatMap(layer =>
    layer.groups.flatMap(group => group.systems)
);

// Helper functions to handle dynamic Tailwind classes
const getBorderClass = (colorClass: string): string => {
    switch (colorClass) {
        case 'slate': return 'border-slate-400';
        case 'purple': return 'border-purple-400';
        case 'green': return 'border-green-400';
        case 'blue': return 'border-blue-400';
        case 'indigo': return 'border-indigo-400';
        case 'orange': return 'border-orange-400';
        case 'rose': return 'border-rose-400';
        default: return 'border-gray-400';
    }
};

const getTextClass = (colorClass: string): string => {
    switch (colorClass) {
        case 'slate': return 'text-slate-700';
        case 'purple': return 'text-purple-700';
        case 'green': return 'text-green-700';
        case 'blue': return 'text-blue-700';
        case 'indigo': return 'text-indigo-700';
        case 'orange': return 'text-orange-700';
        case 'rose': return 'text-rose-700';
        default: return 'text-gray-700';
    }
};

const getBgClass = (colorClass: string): string => {
    switch (colorClass) {
        case 'slate': return 'bg-slate-500';
        case 'purple': return 'bg-purple-500';
        case 'green': return 'bg-green-500';
        case 'blue': return 'bg-blue-500';
        case 'indigo': return 'bg-indigo-500';
        case 'orange': return 'bg-orange-500';
        case 'rose': return 'bg-rose-500';
        default: return 'bg-gray-500';
    }
};

// The native width designed for the diagram
const BASE_CONTENT_WIDTH = 1400;

interface LineCoords {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type: 'source' | 'target';
}

const App: React.FC = () => {
    const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
    const [selectedMilestone, setSelectedMilestone] = useState<AirportMilestone | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [scale, setScale] = useState(1);

    // Line Drawing State
    const [lines, setLines] = useState<LineCoords[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Connection State
    const [connectedNodes, setConnectedNodes] = useState<{
        sources: string[];
        targets: string[];
    }>({ sources: [], targets: [] });

    // Handle Scaling Logic
    useLayoutEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const availableWidth = width - 40;
            let newScale = Math.min(availableWidth / BASE_CONTENT_WIDTH, 1);
            newScale = Math.max(newScale, 0.4);
            setScale(newScale);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate lines and connections
    const updateVisuals = useCallback(() => {
        // If in Milestone mode, clear lines (visual noise reduction)
        if (selectedMilestone) {
            setLines([]);
            setConnectedNodes({ sources: [], targets: [] });
            return;
        }

        if (!selectedSystem || !containerRef.current) {
            setLines([]);
            setConnectedNodes({ sources: [], targets: [] });
            return;
        }

        const containerRect = containerRef.current.getBoundingClientRect();

        const getCenter = (id: string) => {
            const el = document.getElementById(id);
            if (!el) return null;
            const rect = el.getBoundingClientRect();

            // Adjust for offset center to prevent lines from being hidden behind cards
            // Only apply offset if needed, but here simple center is usually fine if z-index is managed
            // Adding slight offset to edges could help, but keeping center for now as requested by user previously
            // to support clear recursive tracing.

            const centerX = (rect.left - containerRect.left) / scale + (rect.width / scale) / 2;
            const centerY = (rect.top - containerRect.top) / scale + (rect.height / scale) / 2;

            // Simple visual tweak: shift start/end points slightly towards the direction of flow if we wanted arrows outside
            // But strict center connection is more robust for automatic layout.
            return { x: centerX, y: centerY };
        };

        const newLines: LineCoords[] = [];
        const foundSources = new Set<string>();
        const foundTargets = new Set<string>();

        const visitedUp = new Set<string>();
        const visitedDown = new Set<string>();

        // 1. Recursive Upstream Trace
        const traceUpstream = (currentId: string) => {
            const incomingNodes = ALL_SYSTEMS.filter(s => s.targets?.includes(currentId));

            incomingNodes.forEach(sourceNode => {
                const sourceId = sourceNode.id;
                foundSources.add(sourceId);

                const edgeId = `${sourceId}-${currentId}`;
                if (!newLines.some(l => l.id === edgeId)) {
                    const startPos = getCenter(sourceId);
                    const endPos = getCenter(currentId);

                    if (startPos && endPos) {
                        // Shorten line slightly to not go under the card center fully
                        const dx = endPos.x - startPos.x;
                        const dy = endPos.y - startPos.y;
                        const angle = Math.atan2(dy, dx);
                        const offset = 40; // Pixel offset from center

                        newLines.push({
                            id: edgeId,
                            x1: startPos.x + Math.cos(angle) * offset,
                            y1: startPos.y + Math.sin(angle) * offset,
                            x2: endPos.x - Math.cos(angle) * offset,
                            y2: endPos.y - Math.sin(angle) * offset,
                            type: 'source'
                        });
                    }
                }

                if (!visitedUp.has(sourceId)) {
                    visitedUp.add(sourceId);
                    traceUpstream(sourceId);
                }
            });
        };

        // 2. Recursive Downstream Trace
        const traceDownstream = (currentId: string) => {
            const node = ALL_SYSTEMS.find(s => s.id === currentId);
            if (!node || !node.targets) return;

            node.targets.forEach(targetId => {
                foundTargets.add(targetId);

                const edgeId = `${currentId}-${targetId}`;
                if (!newLines.some(l => l.id === edgeId)) {
                    const startPos = getCenter(currentId);
                    const endPos = getCenter(targetId);

                    if (startPos && endPos) {
                        const dx = endPos.x - startPos.x;
                        const dy = endPos.y - startPos.y;
                        const angle = Math.atan2(dy, dx);
                        const offset = 40;

                        newLines.push({
                            id: edgeId,
                            x1: startPos.x + Math.cos(angle) * offset,
                            y1: startPos.y + Math.sin(angle) * offset,
                            x2: endPos.x - Math.cos(angle) * offset,
                            y2: endPos.y - Math.sin(angle) * offset,
                            type: 'target'
                        });
                    }
                }

                if (!visitedDown.has(targetId)) {
                    visitedDown.add(targetId);
                    traceDownstream(targetId);
                }
            });
        };

        traceUpstream(selectedSystem);
        traceDownstream(selectedSystem);

        setConnectedNodes({
            sources: Array.from(foundSources),
            targets: Array.from(foundTargets)
        });
        setLines(newLines);

    }, [selectedSystem, selectedMilestone, scale]);

    // Recalculate on select, resize, or scroll
    useLayoutEffect(() => {
        const timer = requestAnimationFrame(updateVisuals);
        return () => cancelAnimationFrame(timer);
    }, [updateVisuals, scale]);

    const handleSystemClick = useCallback((system: SystemNode) => {
        // If clicking a system, exit milestone mode
        setSelectedMilestone(null);
        setSelectedSystem(system.id);
    }, []);

    const handleMilestoneClick = useCallback((milestone: AirportMilestone) => {
        if (selectedMilestone === milestone) {
            setSelectedMilestone(null); // Toggle off
        } else {
            setSelectedMilestone(milestone);
            setSelectedSystem(null); // Clear system selection
        }
    }, [selectedMilestone]);

    const getConnectionStatus = (id: string) => {
        if (selectedMilestone) return null; // No connections in milestone mode
        if (connectedNodes.sources.includes(id)) return 'source';
        if (connectedNodes.targets.includes(id)) return 'target';
        return null;
    };

    const selectedNode = ALL_SYSTEMS.find(s => s.id === selectedSystem);

    return (
        <div className="h-[100dvh] font-sans text-slate-800 relative overflow-hidden bg-[#f8fafc] flex flex-col">

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none -z-10" />

            {/* Header */}
            <header className="pt-4 md:pt-6 pb-2 px-4 text-center max-w-4xl mx-auto relative z-10 shrink-0 w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-2 tracking-wide uppercase">
                    Smart Airport - Digital Transformation
                </div>
                <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
                    智慧機場 - 數位轉型架構
                </h1>
                <p className="text-slate-600 text-xs md:text-sm max-w-xl mx-auto">
                    整合 OT 營運數據、IT 資訊系統與 AI 決策中樞
                </p>

                {/* Milestone Selectors */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-4">
                    {[
                        { m: AirportMilestone.V1, label: 'Airport 1.0', desc: '人工作業', icon: '👤', color: 'slate' },
                        { m: AirportMilestone.V2, label: 'Airport 2.0', desc: '自動化', icon: '⚡', color: 'amber' },
                        { m: AirportMilestone.V3, label: 'Airport 3.0', desc: '數位整合', icon: '🌐', color: 'blue' },
                        { m: AirportMilestone.V4, label: 'Airport 4.0', desc: '智慧預測', icon: '🧠', color: 'purple' },
                    ].map((btn) => {
                        // Fix: Use explicit classes instead of dynamic template strings
                        const getActiveStyles = () => {
                            if (selectedMilestone !== btn.m) return '';
                            switch (btn.color) {
                                case 'slate': return 'bg-slate-100 border-slate-500 text-slate-800 ring-2 ring-slate-200';
                                case 'amber': return 'bg-amber-100 border-amber-500 text-amber-800 ring-2 ring-amber-200';
                                case 'blue': return 'bg-blue-100 border-blue-500 text-blue-800 ring-2 ring-blue-200';
                                case 'purple': return 'bg-purple-100 border-purple-500 text-purple-800 ring-2 ring-purple-200';
                                default: return '';
                            }
                        };

                        return (
                            <button
                                key={btn.m}
                                onClick={() => handleMilestoneClick(btn.m)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300
                                    ${selectedMilestone === btn.m
                                        ? `${getActiveStyles()} shadow-md transform scale-105`
                                        : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50 hover:border-gray-300'
                                    }
                                    ${selectedMilestone && selectedMilestone !== btn.m ? 'opacity-50' : 'opacity-100'}
                                `}
                            >
                                <span className="text-lg">{btn.icon}</span>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="font-bold text-xs">{btn.label}</span>
                                    <span className="text-[10px] opacity-80 mt-0.5">{btn.desc}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Diagram Container */}
            <main className="w-full flex-1 overflow-x-hidden overflow-y-auto relative cursor-grab active:cursor-grabbing no-scrollbar flex flex-col items-center">

                <div
                    className="origin-top transition-transform duration-200 ease-out pt-6 shrink-0"
                    style={{
                        transform: `scale(${scale})`,
                        width: `${BASE_CONTENT_WIDTH}px`,
                        marginBottom: `-${(1 - scale) * 800}px`
                    }}
                >
                    {/* Legend - Only show if NO milestone selected to avoid clutter */}
                    {!selectedMilestone && (
                        <div className="flex justify-center gap-4 mb-8 px-4 transition-opacity duration-300">
                            <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200">
                                <div className="w-3 h-3 rounded bg-white border border-gray-300"></div>
                                <span className="text-slate-600">既有/規劃系統</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200">
                                <div className="w-3 h-3 rounded bg-emerald-500 shadow-sm"></div>
                                <span className="text-emerald-700 font-bold">新增 (NEW)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200">
                                <div className="w-3 h-3 rounded bg-amber-400 shadow-sm"></div>
                                <span className="text-amber-700 font-bold">來源 (Source)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200">
                                <div className="w-3 h-3 rounded bg-emerald-400 shadow-sm"></div>
                                <span className="text-emerald-700 font-bold">去向 (Dest)</span>
                            </div>
                        </div>
                    )}

                    <div ref={containerRef} className="relative w-full px-4 pb-20">

                        {/* SVG Overlay */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                            <defs>
                                <marker id="arrowhead-target" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#34d399" />
                                </marker>
                                <marker id="arrowhead-source" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
                                </marker>
                                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
                                </filter>
                            </defs>
                            {lines.map((line) => {
                                const pathData = `M ${line.x1} ${line.y1} C ${line.x1 + 60} ${line.y1}, ${line.x2 - 60} ${line.y2}, ${line.x2} ${line.y2}`;
                                const midX = (line.x1 + line.x2) / 2;
                                const midY = (line.y1 + line.y2) / 2;
                                const isSource = line.type === 'source';
                                const labelColor = isSource ? '#fbbf24' : '#34d399';
                                const labelText = isSource ? 'Source' : 'Target';

                                return (
                                    <g key={line.id}>
                                        <path
                                            d={pathData}
                                            fill="none"
                                            stroke={isSource ? '#fcd34d' : '#6ee7b7'}
                                            strokeWidth="6"
                                            className="opacity-30"
                                        />
                                        <path
                                            d={pathData}
                                            fill="none"
                                            stroke={isSource ? '#fbbf24' : '#34d399'}
                                            strokeWidth="2.5"
                                            markerEnd={`url(#arrowhead-${line.type})`}
                                            className="transition-all duration-300 drop-shadow-sm"
                                        />
                                        <path
                                            d={pathData}
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeDasharray="4,8"
                                            strokeLinecap="round"
                                            className="animate-flow opacity-90 mix-blend-overlay"
                                        />

                                        {/* Label Badge */}
                                        <g transform={`translate(${midX}, ${midY})`}>
                                            <rect
                                                x="-20"
                                                y="-9"
                                                width="40"
                                                height="18"
                                                rx="9"
                                                fill="white"
                                                stroke={labelColor}
                                                strokeWidth="1.5"
                                            />
                                            <text
                                                x="0"
                                                y="3"
                                                textAnchor="middle"
                                                fontSize="9"
                                                fontWeight="bold"
                                                fill={isSource ? '#92400e' : '#065f46'}
                                                className="select-none pointer-events-none"
                                                style={{ fontFamily: 'sans-serif' }}
                                            >
                                                {labelText}
                                            </text>
                                        </g>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Table Layout */}
                        <table className="w-full table-fixed border-collapse relative z-10">
                            <thead>
                                <tr>
                                    {ARCHITECTURE_DATA.map((layer) => (
                                        <th key={layer.id} className="pb-4 align-bottom">
                                            <div className="inline-block px-4 py-1 rounded-full bg-slate-200/50 text-slate-600 text-sm font-bold tracking-wider">
                                                {layer.title}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {ARCHITECTURE_DATA.map((layer, layerIndex) => (
                                        <td key={layer.id} className="align-top px-3 h-full">
                                            <div className="flex flex-col gap-6 h-full">
                                                {layer.groups.map((group, gIndex) => (
                                                    <div
                                                        key={`${layer.id}-g${gIndex}`}
                                                        className={`
                                                            flex-1 border-l-4 rounded-r-xl bg-white/50 p-4 shadow-sm backdrop-blur-sm
                                                            ${getBorderClass(group.colorClass)}
                                                        `}
                                                    >
                                                        {group.name && (
                                                            <h3 className={`font-bold ${getTextClass(group.colorClass)} mb-3 text-sm flex items-center gap-2`}>
                                                                <span className={`w-2 h-2 rounded-full ${getBgClass(group.colorClass)}`}></span>
                                                                {group.name}
                                                            </h3>
                                                        )}

                                                        <div className={`
                                                            grid gap-3
                                                            ${group.direction === 'col' ? 'grid-cols-1' : 'grid-cols-2'}
                                                        `}>
                                                            {group.systems.map(system => (
                                                                <SystemCard
                                                                    key={system.id}
                                                                    system={system}
                                                                    isActive={selectedSystem === system.id}
                                                                    // Milestone Logic - Inclusive Match
                                                                    milestoneMode={!!selectedMilestone}
                                                                    isMilestoneMatch={!!selectedMilestone && parseFloat(system.milestone) <= parseFloat(selectedMilestone)}

                                                                    connectionStatus={getConnectionStatus(system.id)}
                                                                    onClick={handleSystemClick}
                                                                    colorClass={group.colorClass}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <ChatWidget
                isOpen={isChatOpen}
                setIsOpen={setIsChatOpen}
                activeSystem={selectedNode}
            />
        </div>
    );
};

export default App;