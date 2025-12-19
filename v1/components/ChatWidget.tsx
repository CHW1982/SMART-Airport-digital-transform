import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, SystemNode } from '../types';
import { generateResponse, hasApiKey, removeApiKey } from '../services/geminiService';
import { ApiKeySetup } from './ApiKeySetup';

interface ChatWidgetProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    activeSystem?: SystemNode | undefined;
}

const PRESET_QUESTIONS = [
    { label: "QMS 效益", query: "說明「QMS (排隊管理系統)」的具體效益。" },
    { label: "AODB vs BAS", query: "比較「AODB」和「BAS」在數據中台中的角色。" },
    { label: "ACDMP 支援 RMS", query: "說明「ACDMP」如何支援「RMS (Auto-Alloc)」進行資源分配。" }
];

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, setIsOpen, activeSystem }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'init',
            role: 'ai',
            content: '您好！我是高雄機場的 AI 系統架構師。\n\n您可以先**點擊圖表選取系統**，再按右下角按鈕開啟對話，我將為您解釋該系統的功能與數據流向。',
            timestamp: Date.now()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [showApiKeySetup, setShowApiKeySetup] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, isOpen]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Process with API
        const responseText = await generateResponse(text);

        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: responseText,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    };

    // Simple Markdown-like renderer (Bold and newlines)
    const renderContent = (content: string) => {
        return content.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={i} className="mb-1 last:mb-0 min-h-[1.2em]">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-blue-700 font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    // Construct the list of suggestion chips
    const displayQuestions = activeSystem
        ? [
            {
                label: `詢問 ${activeSystem.name}`,
                query: `請說明「${activeSystem.name}」系統在此架構中的角色。\n備註：${activeSystem.description}`
            },
            ...PRESET_QUESTIONS
        ]
        : PRESET_QUESTIONS;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            <div
                className={`
                    pointer-events-auto bg-white w-full max-w-[380px] sm:w-[380px] h-[500px] md:h-[550px]
                    rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden 
                    transition-all duration-300 origin-bottom-right mb-4
                    ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}
                `}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">AI 系統架構顧問</h3>
                            <span className="text-[10px] opacity-80 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                {hasApiKey() ? 'Online' : 'API Key 未設置'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasApiKey() && (
                            <button
                                onClick={() => {
                                    if (confirm('確定要移除 API Key 嗎？')) {
                                        removeApiKey();
                                        setShowApiKeySetup(true);
                                    }
                                }}
                                className="hover:bg-white/20 rounded-full p-1.5 transition"
                                title="移除 API Key"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        )}
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1.5 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 shrink-0 border border-indigo-200">
                                    <span className="text-xs">🤖</span>
                                </div>
                            )}
                            <div
                                className={`
                                    max-w-[85%] p-3 text-sm rounded-2xl shadow-sm
                                    ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 border border-gray-200 rounded-tl-none'
                                    }
                                `}
                            >
                                {renderContent(msg.content)}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 border border-indigo-200">
                                <span className="text-xs">...</span>
                            </div>
                            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Preset Questions Area */}
                <div className="bg-white px-3 pt-3 pb-1 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-100 shrink-0">
                    {displayQuestions.map((q, idx) => (
                        <button
                            key={idx}
                            onClick={() => !isTyping && handleSendMessage(q.query)}
                            disabled={isTyping}
                            className={`
                                whitespace-nowrap px-3 py-1.5 text-xs rounded-full border transition disabled:opacity-50
                                ${idx === 0 && activeSystem
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 font-medium'
                                    : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                                }
                            `}
                        >
                            {q.label}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSendMessage(input)}
                            placeholder="輸入問題或點擊上方建議..."
                            disabled={isTyping}
                            className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition disabled:opacity-50"
                        />
                        <button
                            onClick={() => handleSendMessage(input)}
                            disabled={!input.trim() || isTyping}
                            className="bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 group relative"
            >
                <span className="text-xl group-hover:animate-bounce">✨</span>

                <span className={`font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'max-w-0 opacity-0' : 'max-w-[100px] opacity-100 pr-2'}`}>
                    AI 顧問
                </span>
            </button>

            {/* API Key Setup Button - Shows when no key is set */}
            {!hasApiKey() && !isOpen && (
                <button
                    onClick={() => setShowApiKeySetup(true)}
                    className="pointer-events-auto mt-3 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-sm font-bold"
                >
                    <span>🔑</span>
                    <span>設置 API Key</span>
                </button>
            )}

            {/* API Key Setup Dialog */}
            {showApiKeySetup && <ApiKeySetup onComplete={() => setShowApiKeySetup(false)} />}
        </div>
    );
};