import { LayerData, LayerType, SystemType, AirportMilestone } from './types';

export const SYSTEM_PROMPT = `
你現在是智慧機場轉型計畫的首席系統架構師。你的任務是根據「智慧機場 - 數位轉型架構」回答使用者的問題。

本架構參考了 Arthur D. Little "Airport 4.0" 與 ACI 定義，分為四個演進階段：
- Airport 1.0 (人工協作)：流程高度依賴人工介入，IT 僅作為輔助工具 (如 紙本作業、電話調度)。
- Airport 2.0 (效率優化)：自助服務與流程自動化 (如 CUSS, FIDS)。
- Airport 3.0 (數位整合)：數據流動與協作 (如 AODB, App)。
- Airport 4.0 (智慧預測)：AI 驅動、物聯網與全面感知 (如 ACDMP, Digital Twin)。

當使用者詢問特定系統時，請依照此格式回答：
1. **系統定位**：說明層級 (Layer 1~4) 與 里程碑 (Airport 1.0~4.0)。
2. **數據流向**：說明它將數據傳給誰，或從誰接收指令。
3. **智慧/綠色效益**：說明它如何具體貢獻於「預測性資源分配」或「淨零永續」目標。

請保持語氣專業、自信且友善，使用繁體中文。
`;

export const ARCHITECTURE_DATA: LayerData[] = [
    {
        id: LayerType.SOURCE,
        title: "1. 資料感知與來源層",
        groups: [
            {
                name: "外部與航運數據",
                colorClass: "slate",
                systems: [
                    { id: "gis", name: "GIS & BIM", subLabel: "地理/建物資訊", description: "提供地理與建築物3D資訊，數位分身基礎", type: SystemType.EXISTING, milestone: AirportMilestone.V4, targets: ["dw"] },
                    { id: "atc", name: "ATC & NAVAIDS", subLabel: "航管/助航", description: "提供航管與助航設備即時狀態，基礎飛航安全", type: SystemType.EXISTING, milestone: AirportMilestone.V1, targets: ["aodb"] },
                    { id: "amhs", name: "AMHS & WTS", subLabel: "氣象/航空電訊", description: "提供航空氣象數據，基礎通訊設施", type: SystemType.EXISTING, milestone: AirportMilestone.V1, targets: ["aodb"] },
                    { id: "vgds", name: "VGDS", subLabel: "目視停靠導引", description: "提供航機停靠即時位置與狀態，自動化停機坪", type: SystemType.EXISTING, milestone: AirportMilestone.V2, targets: ["aodb"] },
                    { id: "aabms", name: "AABMS", subLabel: "機坪空橋管理", description: "管理機坪與空橋運作數據", type: SystemType.EXISTING, milestone: AirportMilestone.V2, targets: ["aodb"] },
                ]
            },
            {
                name: "特殊系統 (Smart)",
                colorClass: "purple",
                systems: [
                    { id: "dcs", name: "DCS / CUSS", subLabel: "離境/自助報到", description: "負責旅客報到與離境控制，自助服務核心", type: SystemType.EXISTING, milestone: AirportMilestone.V2, targets: ["aodb", "dw"] },
                    { id: "bhs", name: "BHS & BTS", subLabel: "行李處理", description: "負責行李分揀與RFID追蹤，自動化物流", type: SystemType.EXISTING, milestone: AirportMilestone.V2, targets: ["aodb", "dw"] },
                    { id: "pss", name: "PSS / e-Gate", subLabel: "安檢/通關", description: "負責旅客安檢與自動通關，生物辨識初步應用", type: SystemType.EXISTING, milestone: AirportMilestone.V3, targets: ["dw"] },
                    { id: "ct", name: "CT / Custom", subLabel: "通關查驗/海關", description: "海關與通關查驗數據", type: SystemType.EXISTING, milestone: AirportMilestone.V2, targets: ["dw"] },
                    { id: "paxt", name: "PAXT", subLabel: "旅客追蹤系統", description: "追蹤旅客流動位置與熱點分析，人流數據化", type: SystemType.EXISTING, milestone: AirportMilestone.V3, targets: ["dw"] },
                    { id: "qms", name: "QMS", subLabel: "排隊管理系統", description: "AI監測排隊人流長度，用於預測安檢時間", type: SystemType.NEW, milestone: AirportMilestone.V4, targets: ["dw"] },
                    { id: "bio", name: "Biometric Hub", subLabel: "生物識別中樞", description: "整合臉部/虹膜數據，實現One ID單一通行證", type: SystemType.NEW, milestone: AirportMilestone.V4, colSpan: 2, targets: ["dw"] },
                    { id: "ghms", name: "GHMS", subLabel: "地勤資源管理", description: "監控地勤車輛與作業進度，用於預測飛機週轉", type: SystemType.NEW, milestone: AirportMilestone.V4, colSpan: 2, targets: ["dw", "aodb"] },
                ]
            },
            {
                name: "設施與安防 (Green & Safety)",
                colorClass: "green",
                systems: [
                    { id: "pms", name: "PMS / LCS", subLabel: "電力/照明", description: "電力與照明控制系統，基礎設施", type: SystemType.EXISTING, milestone: AirportMilestone.V1, targets: ["bas"] },
                    { id: "hvac", name: "HVAC", subLabel: "空調通風", description: "空調與通風控制系統，關鍵節能設備", type: SystemType.EXISTING, milestone: AirportMilestone.V1, targets: ["bas"] },
                    { id: "wcs", name: "WCS", subLabel: "給排水", description: "給排水控制", type: SystemType.EXISTING, milestone: AirportMilestone.V1, targets: ["bas"] },
                    { id: "fls", name: "FLS", subLabel: "消防維生", description: "消防與維生系統監控", type: SystemType.EXISTING, milestone: AirportMilestone.V1, targets: ["bas"] },
                    { id: "scs", name: "SCS / ACS", subLabel: "安防/門禁", description: "整合安防監控與門禁管制", type: SystemType.EXISTING, milestone: AirportMilestone.V2, targets: ["bas"] },
                    { id: "evs", name: "EVS", subLabel: "環境監測", description: "機場環境品質與傳感器監測", type: SystemType.EXISTING, milestone: AirportMilestone.V2, targets: ["bas"] },
                    { id: "water", name: "Smart Water IoT", subLabel: "智慧水務", description: "微量漏水偵測與水質監測，物聯網應用", type: SystemType.NEW, milestone: AirportMilestone.V4, targets: ["bas"] },
                    { id: "swms", name: "SWMS", subLabel: "智慧廢棄物", description: "廢棄物容量偵測，優化清運，物聯網應用", type: SystemType.NEW, milestone: AirportMilestone.V4, colSpan: 2, targets: ["bas"] },
                ]
            }
        ]
    },
    {
        id: LayerType.INTEGRATION,
        title: "2. 資料整合與核心層",
        groups: [
            {
                name: "營運數據核心 (OT)",
                colorClass: "blue",
                direction: 'col',
                systems: [
                    { id: "aodb", name: "AODB", subLabel: "機場營運資料庫", description: "核心航班表資料庫，資源分配的基礎，Airport 3.0 核心", type: SystemType.CORE, milestone: AirportMilestone.V3, targets: ["dw", "fids", "pa"] },
                    { id: "bas", name: "BAS", subLabel: "智慧建築管理", description: "核心設施控制系統，節能策略執行端，整合控制", type: SystemType.CORE, milestone: AirportMilestone.V3, targets: ["dw", "ems"] }
                ]
            }
        ]
    },
    {
        id: LayerType.INTELLIGENCE,
        title: "3. 智慧中台與決策層",
        groups: [
            {
                colorClass: "indigo",
                direction: 'col',
                systems: [
                    { id: "dw", name: "Data Warehouse", subLabel: "中台資料倉儲", description: "負責數據清洗、儲存歷史數據與API管理，大數據基礎", type: SystemType.EXISTING, milestone: AirportMilestone.V3, targets: ["acdmp", "bis"] },
                    { id: "acdmp", name: "ACDMP", subLabel: "機場協同決策平台", description: "智慧大腦，負責資源衝突預警、情境模擬與建議，Airport 4.0 核心", type: SystemType.CORE, milestone: AirportMilestone.V4, targets: ["rms", "mcps"] },
                ]
            }
        ]
    },
    {
        id: LayerType.APPLICATION,
        title: "4. 應用與傳遞層",
        groups: [
            {
                name: "旅客與商業",
                colorClass: "orange",
                systems: [
                    { id: "fids", name: "FIDS / App", subLabel: "顯示 / App", description: "航班資訊顯示(2.0) 與 旅客App服務(3.0)", type: SystemType.EXISTING, milestone: AirportMilestone.V2, colSpan: 2 },
                    { id: "pa", name: "PA / PABX", subLabel: "廣播 / 通訊", description: "公共廣播與通訊系統整合", type: SystemType.EXISTING, milestone: AirportMilestone.V1, colSpan: 2 },
                    { id: "bis", name: "BIS Dashboard", subLabel: "商業智慧", description: "商業智慧儀表板，提供營運績效分析", type: SystemType.EXISTING, milestone: AirportMilestone.V3, colSpan: 2 },
                ]
            },
            {
                name: "營運與安防",
                colorClass: "rose",
                systems: [
                    { id: "mcps", name: "MCPS / ERS", subLabel: "機動 / 緊急", description: "機動指揮與緊急應變系統", type: SystemType.EXISTING, milestone: AirportMilestone.V2, colSpan: 2 },
                    { id: "rms", name: "RMS (Auto-Alloc)", subLabel: "資源自動分配", description: "資源管理系統，負責執行AI建議的自動分配", type: SystemType.EXISTING, milestone: AirportMilestone.V4, colSpan: 2 },
                    { id: "ems", name: "EMS Dashboard", subLabel: "能源碳排", description: "能源管理儀表板，監控碳排與能耗", type: SystemType.EXISTING, milestone: AirportMilestone.V3, colSpan: 2 },
                ]
            }
        ]
    }
];