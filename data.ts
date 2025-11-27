
import { FounderProfile, Trait, LocalizedString } from './types';

// --- MBTI DATA ---

// Groups: Analysts (NT), Diplomats (NF), Sentinels (SJ), Explorers (SP)
const MBTI_TYPES = [
  // Analysts (NT) - The Rationals
  { 
    id: "INTJ", 
    name: { en: "The Architect", zh: "建筑师 (INTJ)" }, 
    desc: { en: "Strategic thinkers with a plan for everything.", zh: "幕后黑手，一切皆在算计之中。" },
    pros: { en: "Strategic, Efficient", zh: "战略大师，执行力强" },
    cons: { en: "Arrogant, Judgmental", zh: "傲慢，不近人情" }
  },
  { 
    id: "INTP", 
    name: { en: "The Logician", zh: "逻辑学家 (INTP)" }, 
    desc: { en: "Innovative inventors with an unquenchable thirst for knowledge.", zh: "硬核极客，只想重构代码。" },
    pros: { en: "Innovative, Logical", zh: "创新思维，逻辑严密" },
    cons: { en: "Absent-minded, Condescending", zh: "拖延症，厌恶社交" }
  },
  { 
    id: "ENTJ", 
    name: { en: "The Commander", zh: "指挥官 (ENTJ)" }, 
    desc: { en: "Bold, imaginative and strong-willed leaders.", zh: "天生的独裁CEO。" },
    pros: { en: "Efficient, Energetic", zh: "极强领导力，目标导向" },
    cons: { en: "Intolerant, Impatient", zh: "独裁，缺乏耐心" }
  },
  { 
    id: "ENTP", 
    name: { en: "The Debater", zh: "辩论家 (ENTP)" }, 
    desc: { en: "Smart and curious thinkers who cannot resist an intellectual challenge.", zh: "杠精转世，也是点子王。" },
    pros: { en: "Knowledgeable, Quick-thinking", zh: "极具创意，适应力强" },
    cons: { en: "Argumentative, Insensitive", zh: "三分钟热度，容易跑题" }
  },

  // Diplomats (NF) - The Idealists
  { 
    id: "INFJ", 
    name: { en: "The Advocate", zh: "提倡者 (INFJ)" }, 
    desc: { en: "Quiet and mystical, yet very inspiring and tireless idealists.", zh: "佛系创业者，直觉准得可怕。" },
    pros: { en: "Creative, Insightful", zh: "洞察力强，理想主义" },
    cons: { en: "Sensitive, Private", zh: "易燃易爆炸，过于敏感" }
  },
  { 
    id: "INFP", 
    name: { en: "The Mediator", zh: "调停者 (INFP)" }, 
    desc: { en: "Poetic, kind and altruistic people.", zh: "emo文学家，为了情怀创业。" },
    pros: { en: "Idealistic, Open-minded", zh: "价值观坚定，极具同理心" },
    cons: { en: "Too altruistic, Impractical", zh: "不切实际，容易内耗" }
  },
  { 
    id: "ENFJ", 
    name: { en: "The Protagonist", zh: "主人公 (ENFJ)" }, 
    desc: { en: "Charismatic and inspiring leaders.", zh: "传销级演说家，让员工为梦想996。" },
    pros: { en: "Charismatic, Reliable", zh: "极具感染力，善于团建" },
    cons: { en: "Overly Idealistic, Intense", zh: "容易轻信，优柔寡断" }
  },
  { 
    id: "ENFP", 
    name: { en: "The Campaigner", zh: "竞选者 (ENFP)" }, 
    desc: { en: "Enthusiastic, creative and sociable free spirits.", zh: "社交恐怖分子，每天100个新点子。" },
    pros: { en: "Energetic, Enthusiastic", zh: "热情洋溢，社交达人" },
    cons: { en: "Unfocused, Disorganized", zh: "缺乏专注，情绪化" }
  },

  // Sentinels (SJ) - The Guardians
  { 
    id: "ISTJ", 
    name: { en: "The Logistician", zh: "物流师 (ISTJ)" }, 
    desc: { en: "Practical and fact-minded individuals.", zh: "人体电子表，流程控。" },
    pros: { en: "Honest, Direct", zh: "极致靠谱，细节控" },
    cons: { en: "Stubborn, Judgmental", zh: "墨守成规，拒绝改变" }
  },
  { 
    id: "ISFJ", 
    name: { en: "The Defender", zh: "守卫者 (ISFJ)" }, 
    desc: { en: "Very dedicated and warm protectors.", zh: "男妈妈/女妈妈型创始人。" },
    pros: { en: "Supportive, Reliable", zh: "忠诚耐心，善于服务" },
    cons: { en: "Overly Humble, Personal", zh: "不懂拒绝，容易过劳" }
  },
  { 
    id: "ESTJ", 
    name: { en: "The Executive", zh: "总经理 (ESTJ)" }, 
    desc: { en: "Excellent administrators.", zh: "绩效考核狂魔，KPI与OKR的忠实信徒。" },
    pros: { en: "Dedicated, Strong-willed", zh: "管理大师，执行力强" },
    cons: { en: "Inflexible, Uncomfortable", zh: "刻板僵化，控制欲强" }
  },
  { 
    id: "ESFJ", 
    name: { en: "The Consul", zh: "执政官 (ESFJ)" }, 
    desc: { en: "Extraordinarily caring, social and popular people.", zh: "八面玲珑，行政后勤一把抓。" },
    pros: { en: "Loyal, Sensitive", zh: "团队润滑剂，乐于助人" },
    cons: { en: "Needy, Inflexible", zh: "缺乏主见，依赖评价" }
  },

  // Explorers (SP) - The Artisans
  { 
    id: "ISTP", 
    name: { en: "The Virtuoso", zh: "鉴赏家 (ISTP)" }, 
    desc: { en: "Bold and practical experimenters.", zh: "全栈工程师，人狠话不多。" },
    pros: { en: "Optimistic, Energetic", zh: "技术大牛，善于攻坚" },
    cons: { en: "Stubborn, Private", zh: "难以捉摸，容易厌倦" }
  },
  { 
    id: "ISFP", 
    name: { en: "The Adventurer", zh: "探险家 (ISFP)" }, 
    desc: { en: "Flexible and charming artists.", zh: "美学至上，对UI/UX有变态要求。" },
    pros: { en: "Charming, Sensitive", zh: "审美在线，适应变化" },
    cons: { en: "Easily Stressed, Independent", zh: "缺乏规划，容易摆烂" }
  },
  { 
    id: "ESTP", 
    name: { en: "The Entrepreneur", zh: "企业家 (ESTP)" }, 
    desc: { en: "Smart, energetic and very perceptive people.", zh: "赌徒性格，梭哈大师。" },
    pros: { en: "Bold, Rational", zh: "敢于冒险，极其敏锐" },
    cons: { en: "Insensitive, Impatient", zh: "缺乏远见，鲁莽行事" }
  },
  { 
    id: "ESFP", 
    name: { en: "The Entertainer", zh: "表演者 (ESFP)" }, 
    desc: { en: "Spontaneous, energetic and enthusiastic people.", zh: "戏精本精，公司就是舞台。" },
    pros: { en: "Bold, Original", zh: "气氛组长，活在当下" },
    cons: { en: "Unfocused, Sensitive", zh: "缺乏耐心，逃避冲突" }
  },
];

export const getAllFounders = (): FounderProfile[] => {
  return MBTI_TYPES.map(t => ({
    id: t.id,
    mbti: t.id,
    name: t.name,
    description: t.desc,
    pros: t.pros,
    cons: t.cons,
    stats: { tech: 0, vision: 0, charisma: 0 }, // Initial base, will be modified by points
  }));
};

// --- TRAITS (BUFFS / DEBUFFS) ---

export const BUFFS: Trait[] = [
  { id: "rich_parents", name: { en: "Trust Fund Baby", zh: "家里有矿" }, description: { en: "Start with extra cash.", zh: "富二代创业，启动资金翻倍。" }, effect: { cash: 100 } },
  { id: "ex_google", name: { en: "Ex-FAANG", zh: "大厂P8" }, description: { en: "High coding standards.", zh: "前大厂技术专家，代码屎山率降低 (+Product)。" }, effect: { product: 10 } },
  { id: "viral_star", name: { en: "Influencer", zh: "自带流量" }, description: { en: "You have a following.", zh: "你是某音百万粉丝博主，获客成本极低 (+Traction)。" }, effect: { traction: 15 } },
  { id: "insomniac", name: { en: "Sleepless Elite", zh: "卷王之王" }, description: { en: "You work 20h days.", zh: "每天只睡4小时，剩下的时间都在卷 (+Team)。" }, effect: { team: 10 } },
];

export const DEBUFFS: Trait[] = [
  { id: "perfectionist", name: { en: "Perfectionist", zh: "强迫症" }, description: { en: "Ship slower.", zh: "像素级纠结，导致产品迟迟无法上线，压力山大 (+Stress)。" }, effect: { stress: 10 } },
  { id: "broke", name: { en: "Student Debt", zh: "现金流断裂" }, description: { en: "Desperate for money.", zh: "不仅没钱，还欠了花呗借呗，急需融资续命 (-Cash)。" }, effect: { cash: -20 } },
  { id: "awkward", name: { en: "Socially Awkward", zh: "社恐患者" }, description: { en: "Bad at pitching.", zh: "见到投资人就结巴，路演效果极差 (-Traction)。" }, effect: { traction: -10 } },
  { id: "toxic", name: { en: "Micro-Manager", zh: "PUA大师" }, description: { en: "Team hates you.", zh: "喜欢微操，甚至管员工上厕所时间，团队离职率高 (-Team)。" }, effect: { team: -15 } },
];

export const getRandomBuff = () => BUFFS[Math.floor(Math.random() * BUFFS.length)];
export const getRandomDebuff = () => DEBUFFS[Math.floor(Math.random() * DEBUFFS.length)];

// --- TRENDS & IDEAS ---

export const CURRENT_TRENDS = [
    "AIGC (生成式人工智能)", 
    "具身智能 (Embodied AI)",
    "低空经济 (eVTOL)",
    "银发经济 (老龄化)", 
    "消费降级 (平替/极致性价比)", 
    "情绪价值 (疗愈/玄学)", 
    "出海 (Global化)"
];

// Formatted as: Pain Point -> Identity -> Decision
export const RANDOM_IDEAS: LocalizedString[] = [
  { 
    en: "AIGC: You're tired of hallucinations, and as a former Google Architect, you decide to build a cheap reasoning model.", 
    zh: "【AIGC】你受够了 ChatGPT 的车轱辘话，而你刚好手握百万高质量中文小说数据，是一个资深网文爱好者，因此决定训练一个专门写“爽文”的垂类模型，让 AI 懂什么叫“莫欺少年穷”。" 
  },
  { 
    en: "Embodied AI: Robots are clumsy. As a Boston Dynamics vet, you build a cat-girl robot.", 
    zh: "【具身智能】你发现独居年轻人不仅缺爱还懒得做家务，而你恰好是波士顿动力的前核心工程师，因此决定研发一款“不仅能拿快递还能陪聊”的具身智能猫娘机器人，主打二次元陪伴市场。" 
  },
  { 
    en: "Silver Economy: Apps are too complex for elders. As a UI expert, you build a 1-button phone.", 
    zh: "【银发经济】你看到奶奶因为不会用智能手机挂号而在寒风中排队，而你正好是互联网大厂的 UI 负责人，因此决定开发一款“只有一个按钮”的老年人万能办事终端，彻底消除数字鸿沟。" 
  },
  { 
    en: "Low Altitude: Traffic sucks. With a drone factory, you build a flying bike.", 
    zh: "【低空经济】你每天上班堵在三环路上怀疑人生，而你刚好家里有航模厂供应链，因此决定制造一款“折叠式单人飞行摩托”，主打城市 5 公里低空通勤，虽然目前还在炸机阶段。" 
  },
  { 
    en: "Consumption Downgrade: Eating out is expensive. As a crawler engineer, you build a discount map.", 
    zh: "【消费降级】你发现打工人吃不起 40 块的外卖，而你是个爬虫高手，因此决定做一个“全城临期食品与倒闭清仓”地图 APP，主打一个极致挂壁，拯救月薪 3000 的灵魂。" 
  },
  { 
    en: "Global: C-dramas are popular. You make an AI face-swap tool for Middle East.", 
    zh: "【出海+短剧】你发现中东土豪也爱看狗血短剧，而你精通 AI 换脸技术，因此决定开发一套“一键生成中东面孔霸总短剧”的工具，把“赘婿龙王”的故事卖到迪拜去。" 
  },
  { 
    en: "Emotion Value: Anxiety is high. You build a Cyber-Buddha.", 
    zh: "【情绪价值】你感到现代人焦虑爆表，而你刚好研究过佛学与心理学，因此决定开发一款“赛博佛祖”APP，内置 GPT-4 驱动的高僧，提供 24 小时敲电子木鱼和算命服务，功德无量。" 
  },
];

export const getRandomIdea = (lang: 'en' | 'zh') => {
  const idea = RANDOM_IDEAS[Math.floor(Math.random() * RANDOM_IDEAS.length)];
  return idea[lang];
}
