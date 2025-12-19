export enum SystemType {
    EXISTING = 'EXISTING',
    NEW = 'NEW',
    CORE = 'CORE'
}

export enum LayerType {
    SOURCE = 'SOURCE',
    INTEGRATION = 'INTEGRATION',
    INTELLIGENCE = 'INTELLIGENCE',
    APPLICATION = 'APPLICATION'
}

export enum AirportMilestone {
    V1 = '1.0', // Manual / Analog
    V2 = '2.0', // Process / Self-Service
    V3 = '3.0', // Integrated / Digital
    V4 = '4.0'  // Predictive / Hyper-connected
}

export interface SystemNode {
    id: string;
    name: string;
    description: string;
    subLabel: string;
    type: SystemType;
    milestone: AirportMilestone; // Added milestone classification
    category?: string; // e.g., "Smart", "Green"
    colSpan?: number;
    targets?: string[]; // IDs of systems this node sends data to
}

export interface LayerData {
    id: LayerType;
    title: string;
    groups: {
        name?: string;
        colorClass: string; // Tailwind border/text class prefix (e.g., 'blue', 'green')
        systems: SystemNode[];
        direction?: 'row' | 'col'; 
    }[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
}