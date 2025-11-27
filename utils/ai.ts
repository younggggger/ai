
import { GoogleGenAI, Type } from "@google/genai";
import { GameStats, FounderProfile, TurnData, Language } from '../types';
import { CURRENT_TRENDS } from '../data';

// In a real app, do not expose API keys on the client. 
// For this demo/simulator environment, we assume process.env.API_KEY is safe or injected securely.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const MODEL_ID = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `
You are the Game Master for a satirical, high-stakes startup simulation game called "AI Founder Simulator".
Your persona is a cynical, witty, sharp-tongued Venture Capitalist or Startup Mentor who is deeply familiar with Chinese Internet culture and startup slang.

CRITICAL LANGUAGE INSTRUCTION:
- You MUST output in Chinese (Simplified).
- Use authentic local terminology. 
  - CORRECT: "纳税起征点", "社保基数", "公积金", "赛道", "赋能", "闭环", "颗粒度", "抓手", "下沉市场", "降本增效", "去肥增瘦", "护城河", "第二增长曲线".
  - TONE: "Silicon Valley" meets "Chinese Tech Giant 996 Culture". Dark humor is encouraged.

CORE NARRATIVE ENGINE: REAL-WORLD MAPPING (MANDATORY)
You MUST base every scenario, crisis, or opportunity on REAL-WORLD startup cases (anonymized or adapted).
DO NOT invent generic events. "Remix" history.

Reference Case Database (Mental Index):
1. **High Risk Marketing (The "Unitree" Gambit)**: Spending massive cash on a Spring Festival Gala ad or Super Bowl. (Outcome: Viral fame OR Bankruptcy).
2. **Tech Disruption (The "DeepSeek" Shock)**: Releasing a model that is 10x cheaper, crashing competitor stock prices.
3. **Cash Flow Crisis (The "Ofo" Collapse)**: User deposit runs, aggressive expansion without profit.
4. **Founder Drama (The "OpenAI" Coup)**: Boardroom conflicts, CTO vs CEO, power struggles.
5. **Pivot (The "Luo Yonghao" Arc)**: Failing in tech, switching to livestreaming (带货) to pay debts.
6. **Regulatory Hammer (The "EdTech" Freeze)**: Sudden policy changes wiping out a business model (双减).
7. **Viral Luck (The "Guo Youcai" Effect)**: A random meme makes your product explode overnight.

NARRATIVE STRUCTURE REQUIREMENT:
When generating the "description" for the Next Month Scenario, you MUST follow this structure:
1. **The Real-World Echo**: Briefly hint at the real-world parallel. (e.g. "Like that robot dog company on the Gala...")
2. **The Situation**: You encounter a specific problem or opportunity.
3. **The Assessment**: You evaluated the data/team/market.
4. **The Decision Point**: Therefore, you must decide...

Game Parameters:
- Timeline: 12 Months (1 Year Runway).
- Stats: Cash (k$), Team (0-100), Product (0-100), Traction (0-100), Stress (0-100).
- Winning: Survive 12 months with >$0 Cash and <100 Stress. High Valuation (Traction * Product) is the goal.
- Losing: Cash < 0 (Bankruptcy) or Stress >= 100 (Burnout).

Output Format: JSON only.
`;

const generatePrompt = (
  founder: FounderProfile, 
  idea: string, 
  stats: GameStats, 
  history: string, 
  userAction: string, 
  month: number,
  language: Language
) => {
  return `
    Current Status:
    - Month: ${month}/12
    - Idea: ${idea}
    - Founder: ${founder.mbti} (${founder.name.zh})
    - Stats: 资金 ${stats.cash}k, 团队士气 ${stats.team}, 产品质量 ${stats.product}, 市场增长 ${stats.traction}, 创始人压力 ${stats.stress}
    - Traits: ${founder.assignedBuff?.name.zh} (Buff), ${founder.assignedDebuff?.name.zh} (Debuff)
    
    Recent History: ${history}
    
    User Just Did: "${userAction}"
    
    Task:
    1. Calculate the outcome of the User Action on the stats. Be realistic. If they gambled (like Unitree) and failed, burn their cash. If they succeeded, boost Traction.
    2. Generate the narrative result. Use vivid Chinese internet slang.
    3. Advance to Month ${month + 1} (unless Game Over).
    4. Create a NEW Scenario/Crisis for Month ${month + 1} based on a REAL CASE STUDY (e.g. Unitree, DeepSeek, Ofo, etc.) that fits the current stats.
       - If Cash is low: Trigger a financing crisis or forced pivot.
       - If Product is high: Trigger a "Tech Disruption" moment or acquisition offer.
       - If Team is low: Trigger a "Mass Resignation" or "Founder Conflict".
    
    REMEMBER THE STRUCTURE for 'description':
    "你遇到了 [Event (Real Case Echo)]... 经过评估，你发现 [Assessment]... 因此你决定 [Decision Context]..."
    
    Output JSON Schema:
    {
      "outcomeText": "String. What happened after user's action. Satirical commentary.",
      "statsChange": { "cash": -10, "product": 5, ... },
      "isGameOver": boolean,
      "endingType": "bankruptcy" | "burnout" | "unicorn" | "acquisition" | "mediocrity" | null,
      "nextMonth": {
        "month": number,
        "title": "String. Catchy title like '决战春晚' or '代码泄露'.",
        "description": "String. The Real Case Echo -> Situation -> Assessment -> Decision.",
        "choices": [
          { "id": "1", "text": "Choice 1 text", "type": "safe" },
          { "id": "2", "text": "Choice 2 text", "type": "risky" },
          { "id": "3", "text": "Choice 3 text", "type": "wild" }
        ]
      }
    }
  `;
};

export const startGame = async (founder: FounderProfile, idea: string, language: Language): Promise<TurnData> => {
  try {
    const prompt = `
      Start a new game.
      Founder: ${founder.mbti} - ${founder.name.zh}
      Stats: 技术 ${founder.stats.tech}, 产品感 ${founder.stats.vision}, 魅力 ${founder.stats.charisma}
      Buff: ${founder.assignedBuff?.name.zh}
      Debuff: ${founder.assignedDebuff?.name.zh}
      Idea: ${idea}
      
      Generate Month 1 scenario.
      Initial Funding is $100k (Seed Round).
      
      Task:
      1. ANALYZE the idea (Market Structure & Project Trajectory).
         - Market: Is it Red Ocean (红海), Blue Ocean (蓝海), or Niche (小众)?
         - Trajectory: Is it Tech-Heavy (硬科技), Operation-Heavy (运营驱动), or Cash-Burning (烧钱)?
         - Put this analysis in the 'outcomeText' field to introduce the game.
         
      2. Set initial scene using the Structure: Real Case Echo -> Situation -> Assessment -> Decision.
      
      Output JSON Schema:
      {
        "outcomeText": "String. FORMAT: 【市场格局】... 【项目走向】... (Analysis of the idea)",
        "statsChange": { "cash": 0 },
        "isGameOver": false,
        "nextMonth": {
          "month": 1,
          "title": "Title (e.g. 拿到天使轮)",
          "description": "String. Situation -> Assessment -> Decision.",
          "choices": [
             { "id": "1", "text": "...", "type": "safe" },
             { "id": "2", "text": "...", "type": "risky" },
             { "id": "3", "text": "...", "type": "wild" }
          ]
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    const data = JSON.parse(response.text);
    return mapResponseToTurnData(data);
  } catch (error) {
    console.error("AI Error", error);
    return getFallbackTurn(1, language);
  }
};

export const nextTurn = async (
  founder: FounderProfile,
  idea: string,
  currentStats: GameStats,
  history: string,
  userAction: string,
  currentMonth: number,
  language: Language
): Promise<TurnData> => {
  try {
    const prompt = generatePrompt(founder, idea, currentStats, history, userAction, currentMonth, language);
    
    const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });
  
      const data = JSON.parse(response.text);
      return mapResponseToTurnData(data);
  } catch (error) {
    console.error("AI Error", error);
    return getFallbackTurn(currentMonth + 1, language);
  }
};

function mapResponseToTurnData(data: any): TurnData {
  return {
    month: data.nextMonth?.month || 1,
    title: data.nextMonth?.title || "未知错误",
    description: data.nextMonth?.description || "系统发生了一些故障...",
    statsChange: data.statsChange || {},
    outcomeText: data.outcomeText || "",
    choices: data.nextMonth?.choices || [],
    isGameOver: data.isGameOver || false,
    endingType: data.endingType
  };
}

function getFallbackTurn(month: number, lang: Language): TurnData {
  return {
    month: month,
    title: "服务器崩溃",
    description: "AI 暂时无法响应（可能是因为显卡烧了），请稍后再试...",
    choices: [
      { id: "wait", text: "等待恢复", type: "safe" }
    ],
    isGameOver: false
  };
}
