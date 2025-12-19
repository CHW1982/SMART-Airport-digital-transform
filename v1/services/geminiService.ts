// API Key Management
const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const getApiKey = (): string | null => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const setApiKey = (key: string): void => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
};

export const removeApiKey = (): void => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
};

export const hasApiKey = (): boolean => {
    const key = getApiKey();
    return key !== null && key.length > 0;
};

// Gemini AI Service
interface GenerateContentResponse {
    response: {
        text(): string;
    };
}

export const generateResponse = async (message: string): Promise<string> => {
    const apiKey = getApiKey();

    if (!apiKey) {
        return '⚠️ 請先設置您的 Gemini API Key 才能使用 AI 功能。\n\n點擊右下角「🔑 設置 API Key」按鈕進行設置。';
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }],
                systemInstruction: {
                    parts: [{
                        text: `你是一位智慧機場架構專家，專門協助說明系統整合、數據流與架構設計。

請用繁體中文回答，遵循以下指南：
1. 提供清晰、專業但易懂的解釋
2. 使用具體範例說明抽象概念
3. 適時使用項目列表或編號列表
4. 重點資訊使用 **粗體** 強調
5. 保持回答簡潔（100-150字）但資訊豐富

架構概念：
- **數據中台 (Data Middle Platform)**: AODB、BAS、FIDS 等核心系統的數據整合層
- **營運層 (OT Layer)**: 實體設備如行李輸送、登機門、安檢等
- **智慧應用層**: AI 驅動的預測與優化系統

回答時保持友善、專業，並適度運用 emoji 增加可讀性。`
                    }]
                }
            })
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                return '⚠️ API Key 無效或已過期，請檢查您的 API Key 是否正確。';
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        return '⚠️ 抱歉，我無法處理您的請求。';

    } catch (error) {
        console.error('Gemini API Error:', error);
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
            return '⚠️ 網路連線失敗，請檢查您的網路狀態。';
        }
        return '⚠️ 連線發生錯誤，請稍後再試。';
    }
};