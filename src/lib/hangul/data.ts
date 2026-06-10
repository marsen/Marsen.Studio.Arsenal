// 初聲（초성）19 個，依 Unicode 順序
export const CHOSEONG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ",
  "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

// 中聲（중성）21 個，依 Unicode 順序
export const JUNGSEONG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ",
  "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
] as const;

// 終聲（종성）28 個，index 0 = 無終聲
export const JONGSEONG = [
  "",   "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ",
  "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ",
  "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ",
  "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

// 子音字母名稱（韓語傳統名稱，用於正確發音）
export const CHOSEONG_NAMES: Record<string, string> = {
  "ㄱ": "기역",  "ㄲ": "쌍기역", "ㄴ": "니은",  "ㄷ": "디귿",  "ㄸ": "쌍디귿",
  "ㄹ": "리을",  "ㅁ": "미음",   "ㅂ": "비읍",  "ㅃ": "쌍비읍", "ㅅ": "시옷",
  "ㅆ": "쌍시옷", "ㅇ": "이응",  "ㅈ": "지읒",  "ㅉ": "쌍지읒", "ㅊ": "치읓",
  "ㅋ": "키읔",  "ㅌ": "티읕",   "ㅍ": "피읖",  "ㅎ": "히읗",
};

// 修訂版韓語羅馬化 — 初聲（字首位置）
export const CHOSEONG_ROMAN: Record<string, string> = {
  "ㄱ": "g",  "ㄲ": "kk", "ㄴ": "n",  "ㄷ": "d",  "ㄸ": "tt",
  "ㄹ": "r",  "ㅁ": "m",  "ㅂ": "b",  "ㅃ": "pp", "ㅅ": "s",
  "ㅆ": "ss", "ㅇ": "-",  "ㅈ": "j",  "ㅉ": "jj", "ㅊ": "ch",
  "ㅋ": "k",  "ㅌ": "t",  "ㅍ": "p",  "ㅎ": "h",
};

// 修訂版韓語羅馬化 — 中聲
export const JUNGSEONG_ROMAN: Record<string, string> = {
  "ㅏ": "a",   "ㅐ": "ae",  "ㅑ": "ya",  "ㅒ": "yae", "ㅓ": "eo",
  "ㅔ": "e",   "ㅕ": "yeo", "ㅖ": "ye",  "ㅗ": "o",   "ㅘ": "wa",
  "ㅙ": "wae", "ㅚ": "oe",  "ㅛ": "yo",  "ㅜ": "u",   "ㅝ": "wo",
  "ㅞ": "we",  "ㅟ": "wi",  "ㅠ": "yu",  "ㅡ": "eu",  "ㅢ": "ui",
  "ㅣ": "i",
};

// 音節範例單詞（以組合音節為 key，找含該音節的常用詞）
export const SYLLABLE_EXAMPLES: Record<string, { word: string; meaning: string }> = {
  // ㄱ
  "가": { word: "가방",     meaning: "包包" },
  "개": { word: "개",       meaning: "狗" },
  "거": { word: "거울",     meaning: "鏡子" },
  "게": { word: "게임",     meaning: "遊戲" },
  "고": { word: "고양이",   meaning: "貓" },
  "구": { word: "구름",     meaning: "雲" },
  "그": { word: "그림",     meaning: "圖畫" },
  "기": { word: "기차",     meaning: "火車" },
  "교": { word: "교실",     meaning: "教室" },
  "규": { word: "규칙",     meaning: "規則" },
  // ㄴ
  "나": { word: "나무",     meaning: "樹木" },
  "내": { word: "내일",     meaning: "明天" },
  "너": { word: "너무",     meaning: "非常" },
  "네": { word: "네",       meaning: "是的" },
  "노": { word: "노래",     meaning: "歌曲" },
  "누": { word: "누나",     meaning: "姊姊" },
  "느": { word: "느낌",     meaning: "感覺" },
  "니": { word: "니들",     meaning: "你們" },
  "뉴": { word: "뉴스",     meaning: "新聞" },
  // ㄷ
  "다": { word: "다리",     meaning: "腿" },
  "대": { word: "대학교",   meaning: "大學" },
  "더": { word: "더위",     meaning: "暑氣" },
  "데": { word: "데이트",   meaning: "約會" },
  "도": { word: "도서관",   meaning: "圖書館" },
  "두": { word: "두부",     meaning: "豆腐" },
  "드": { word: "드라마",   meaning: "韓劇" },
  "디": { word: "디저트",   meaning: "甜點" },
  // ㄹ
  "라": { word: "라면",     meaning: "泡麵" },
  "러": { word: "러시아",   meaning: "俄羅斯" },
  "레": { word: "레몬",     meaning: "檸檬" },
  "로": { word: "로봇",     meaning: "機器人" },
  "리": { word: "리모컨",   meaning: "遙控器" },
  // ㅁ
  "마": { word: "마음",     meaning: "心" },
  "매": { word: "매운",     meaning: "辣的" },
  "머": { word: "머리",     meaning: "頭" },
  "메": { word: "메시지",   meaning: "訊息" },
  "모": { word: "모자",     meaning: "帽子" },
  "무": { word: "무지개",   meaning: "彩虹" },
  "미": { word: "미소",     meaning: "微笑" },
  "뮤": { word: "뮤직",     meaning: "音樂" },
  // ㅂ
  "바": { word: "바나나",   meaning: "香蕉" },
  "배": { word: "배추",     meaning: "白菜" },
  "버": { word: "버스",     meaning: "公車" },
  "베": { word: "베개",     meaning: "枕頭" },
  "보": { word: "보라색",   meaning: "紫色" },
  "부": { word: "부모님",   meaning: "父母" },
  "비": { word: "비빔밥",   meaning: "拌飯" },
  // ㅅ
  "사": { word: "사과",     meaning: "蘋果" },
  "새": { word: "새",       meaning: "鳥" },
  "서": { word: "서울",     meaning: "首爾" },
  "세": { word: "세계",     meaning: "世界" },
  "소": { word: "소고기",   meaning: "牛肉" },
  "수": { word: "수박",     meaning: "西瓜" },
  "스": { word: "스마트폰", meaning: "智慧型手機" },
  "시": { word: "시장",     meaning: "市場" },
  // ㅇ（無聲）
  "아": { word: "아버지",   meaning: "爸爸" },
  "애": { word: "애기",     meaning: "寶寶" },
  "어": { word: "어머니",   meaning: "媽媽" },
  "에": { word: "에어컨",   meaning: "冷氣" },
  "오": { word: "오렌지",   meaning: "柳橙" },
  "우": { word: "우유",     meaning: "牛奶" },
  "으": { word: "음식",     meaning: "食物" },
  "이": { word: "이름",     meaning: "名字" },
  "야": { word: "야채",     meaning: "蔬菜" },
  "여": { word: "여행",     meaning: "旅行" },
  "요": { word: "요리",     meaning: "料理" },
  "유": { word: "유리",     meaning: "玻璃" },
  "왜": { word: "왜",       meaning: "為什麼" },
  "외": { word: "외국",     meaning: "外國" },
  "의": { word: "의사",     meaning: "醫生" },
  // ㅈ
  "자": { word: "자동차",   meaning: "汽車" },
  "재": { word: "재미",     meaning: "樂趣" },
  "저": { word: "저녁",     meaning: "傍晚" },
  "제": { word: "제주도",   meaning: "濟州島" },
  "조": { word: "조용히",   meaning: "安靜地" },
  "주": { word: "주스",     meaning: "果汁" },
  "지": { word: "지하철",   meaning: "地鐵" },
  // ㅊ
  "차": { word: "차",       meaning: "茶" },
  "채": { word: "채소",     meaning: "蔬菜" },
  "처": { word: "처음",     meaning: "第一次" },
  "체": { word: "체육관",   meaning: "體育館" },
  "초": { word: "초콜릿",   meaning: "巧克力" },
  "추": { word: "추석",     meaning: "中秋節" },
  "치": { word: "치킨",     meaning: "炸雞" },
  // ㅋ
  "카": { word: "카페",     meaning: "咖啡廳" },
  "커": { word: "커피",     meaning: "咖啡" },
  "케": { word: "케이크",   meaning: "蛋糕" },
  "코": { word: "코끼리",   meaning: "大象" },
  "쿠": { word: "쿠키",     meaning: "餅乾" },
  "크": { word: "크림",     meaning: "奶油" },
  "키": { word: "키위",     meaning: "奇異果" },
  // ㅌ
  "태": { word: "태양",     meaning: "太陽" },
  "터": { word: "터널",     meaning: "隧道" },
  "테": { word: "테이블",   meaning: "桌子" },
  "토": { word: "토마토",   meaning: "番茄" },
  "티": { word: "티셔츠",   meaning: "T恤" },
  // ㅍ
  "파": { word: "파티",     meaning: "派對" },
  "포": { word: "포도",     meaning: "葡萄" },
  "피": { word: "피자",     meaning: "披薩" },
  // ㅎ
  "하": { word: "하늘",     meaning: "天空" },
  "해": { word: "해",       meaning: "太陽" },
  "허": { word: "허리",     meaning: "腰部" },
  "호": { word: "호랑이",   meaning: "老虎" },
  "후": { word: "후추",     meaning: "胡椒" },
  "히": { word: "히터",     meaning: "暖氣" },
};

// 子音範例單詞（生活常見用詞）
export const CHOSEONG_EXAMPLES: Record<string, { word: string; meaning: string }> = {
  "ㄱ": { word: "가방",   meaning: "包包" },
  "ㄲ": { word: "꿀",     meaning: "蜂蜜" },
  "ㄴ": { word: "나무",   meaning: "樹木" },
  "ㄷ": { word: "다리",   meaning: "腿／橋" },
  "ㄸ": { word: "딸기",   meaning: "草莓" },
  "ㄹ": { word: "라면",   meaning: "泡麵" },
  "ㅁ": { word: "마음",   meaning: "心" },
  "ㅂ": { word: "바나나", meaning: "香蕉" },
  "ㅃ": { word: "빵",     meaning: "麵包" },
  "ㅅ": { word: "사과",   meaning: "蘋果" },
  "ㅆ": { word: "씨앗",   meaning: "種子" },
  "ㅇ": { word: "아이",   meaning: "孩子" },
  "ㅈ": { word: "자동차", meaning: "汽車" },
  "ㅉ": { word: "짜장면", meaning: "炸醬麵" },
  "ㅊ": { word: "차",     meaning: "茶" },
  "ㅋ": { word: "카페",   meaning: "咖啡廳" },
  "ㅌ": { word: "토마토", meaning: "番茄" },
  "ㅍ": { word: "피자",   meaning: "披薩" },
  "ㅎ": { word: "하늘",   meaning: "天空" },
};

// 母音範例單詞（生活常見用詞）
export const JUNGSEONG_EXAMPLES: Record<string, { word: string; meaning: string }> = {
  "ㅏ": { word: "아버지", meaning: "爸爸" },
  "ㅐ": { word: "개",     meaning: "狗" },
  "ㅑ": { word: "야채",   meaning: "蔬菜" },
  "ㅒ": { word: "얘기",   meaning: "話題" },
  "ㅓ": { word: "어머니", meaning: "媽媽" },
  "ㅔ": { word: "에어컨", meaning: "冷氣" },
  "ㅕ": { word: "여행",   meaning: "旅行" },
  "ㅖ": { word: "예쁘다", meaning: "漂亮" },
  "ㅗ": { word: "오렌지", meaning: "柳橙" },
  "ㅘ": { word: "과일",   meaning: "水果" },
  "ㅙ": { word: "왜",     meaning: "為什麼" },
  "ㅚ": { word: "외국",   meaning: "外國" },
  "ㅛ": { word: "요리",   meaning: "料理" },
  "ㅜ": { word: "우유",   meaning: "牛奶" },
  "ㅝ": { word: "뭐",     meaning: "什麼" },
  "ㅞ": { word: "웨딩",   meaning: "婚禮" },
  "ㅟ": { word: "위험",   meaning: "危險" },
  "ㅠ": { word: "유리",   meaning: "玻璃" },
  "ㅡ": { word: "음식",   meaning: "食物" },
  "ㅢ": { word: "의사",   meaning: "醫生" },
  "ㅣ": { word: "이름",   meaning: "名字" },
};
