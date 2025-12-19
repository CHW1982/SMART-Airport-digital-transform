import React, { useState } from 'react';
import { hasApiKey, setApiKey } from '../services/geminiService';

interface ApiKeySetupProps {
    onComplete: () => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onComplete }) => {
    const [inputKey, setInputKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedKey = inputKey.trim();

        if (!trimmedKey) {
            setError('請輸入 API Key');
            return;
        }

        // Basic validation: Gemini API keys usually start with "AIza"
        if (!trimmedKey.startsWith('AIza')) {
            setError('API Key 格式可能不正確（應以 AIza 開頭）');
            return;
        }

        if (trimmedKey.length < 30) {
            setError('API Key 長度太短，請確認是否完整');
            return;
        }

        setApiKey(trimmedKey);
        onComplete();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔑</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">設置 Gemini API Key</h2>
                    <p className="text-sm text-slate-600">
                        需要您的 Google Gemini API Key 才能使用 AI 功能
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="text-blue-800 font-medium mb-2">📌 如何獲取免費 API Key：</p>
                    <ol className="text-blue-700 space-y-1 ml-4 list-decimal">
                        <li>訪問 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-blue-900">Google AI Studio</a></li>
                        <li>使用 Google 帳號登入</li>
                        <li>點擊「Create API Key」</li>
                        <li>複製生成的 API Key</li>
                    </ol>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            您的 API Key
                        </label>
                        <input
                            type="password"
                            value={inputKey}
                            onChange={(e) => {
                                setInputKey(e.target.value);
                                setError('');
                            }}
                            placeholder="AIza..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono text-sm"
                        />
                        {error && (
                            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-800">
                            <strong>🔒 隱私保護：</strong>您的 API Key 只會儲存在您的瀏覽器本地，不會上傳到任何伺服器。
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        保存並開始使用
                    </button>
                </form>

                {hasApiKey() && (
                    <button
                        onClick={onComplete}
                        className="w-full text-slate-500 text-sm hover:text-slate-700 transition"
                    >
                        取消（使用現有 API Key）
                    </button>
                )}
            </div>
        </div>
    );
};
