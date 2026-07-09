/* ============================================
   DayPilot v2.0 - Complete Success System
   Application Logic, Gamification, & Analytics
   ============================================ */

// ---- DOM Helpers ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---- Storage Keys ----
const ENTRIES_KEY = 'dp_entries';
const SETTINGS_KEY = 'dp_settings';
const GAME_KEY = 'dp_game';

// ---- Game State Default ----
let gameState = {
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    lastEntryDate: null,
    badges: [],
    totalEntries: 0,
    totalCalls: 0,
    totalClients: 0,
    totalQuotes: 0,
    totalFollowups: 0,
    recordCalls: 0,
    recordClients: 0,
    recordQuotes: 0,
    recordPower: 0,
    hadPerfectDay: false,
    hadPlanComplete: false,
    challengeAccepted: null,
    challengeCompleted: null
};

// ---- Settings Default ----
let settings = {
    name: '',
    morningTime: '07:00',
    eveningTime: '18:00',
    notifications: false,
    darkMode: true
};

// ---- Entries Database ----
let entries = [];

// ---- Day Themes ----
const DAY_THEMES = {
    0: { name: 'Reflection & Goals', icon: '🟣', tagline: 'Look back to leap forward' },
    1: { name: 'Targets & Planning', icon: '🔴', tagline: 'Set your targets and win!' },
    2: { name: 'Strategy & Numbers', icon: '🟠', tagline: 'Know your numbers, master money' },
    3: { name: 'Visits & Growth', icon: '🟡', tagline: 'Go outside, learn, grow, connect!' },
    4: { name: 'Implementation', icon: '🟢', tagline: 'Stop planning. START DOING!' },
    5: { name: 'Momentum & Finish', icon: '🔵', tagline: 'Push hard, finish strong!' },
    6: { name: 'Follow-ups & Prep', icon: '⚫', tagline: 'Review, follow-up, prepare!' }
};

// ---- Quotes (30 Curated) ----
const QUOTES = [
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Quality means doing it right when no one is looking.", author: "Henry Ford" },
    { text: "Your limit is only your imagination.", author: "Anonymous" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
    { text: "Great things never come from comfort zones.", author: "Anonymous" },
    { text: "Dream it. Wish it. Do it.", author: "Anonymous" },
    { text: "Success doesn't just find you. You have to go out and get it.", author: "Anonymous" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
    { text: "Dream bigger. Do bigger.", author: "Anonymous" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "Anonymous" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Anonymous" },
    { text: "Do something today that your future self will thank you for.", author: "Anonymous" },
    { text: "Little things make big days.", author: "Anonymous" },
    { text: "It's going to be hard, but hard does not mean impossible.", author: "Anonymous" },
    { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Anonymous" },
    { text: "The key to success is to focus on goals, not obstacles.", author: "Anonymous" },
    { text: "Be proud of how hard you are trying.", author: "Anonymous" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "The master has failed more times than the beginner has even tried.", author: "Stephen McCranie" },
    { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
    { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Do not wait for the perfect moment. Take the moment and make it perfect.", author: "Anonymous" }
];

// ---- Tips (30 Curated) ----
const TIPS = [
    "Send a voice note instead of text — it feels more personal to clients 🎙️",
    "Follow the 2-minute rule: If it takes less than 2 min, do it NOW ⚡",
    "Take a photo of every client's office/setup — review it before follow-up 📸",
    "Ask clients: 'What would make you switch from your current vendor?' 💡",
    "Create a WhatsApp Broadcast list for your top 20 clients 📱",
    "Learn one industry-specific term every day 📚",
    "Use the 3-call rule: Call a new lead within 3 hours of first contact ⏰",
    "Share a relevant article with 5 clients today — become their advisor 🧠",
    "Record your sales pitch and listen back — you'll be surprised! 🎧",
    "Map your competitors' clients — make a target list 🗺️",
    "Ask for referrals after every successful delivery 🤝",
    "Create a one-page product comparison sheet 📄",
    "Send a thank-you note after every meeting, no matter the outcome 💌",
    "Study one successful salesperson's technique each week 🎓",
    "Build a FAQ document for common client objections 🛡️",
    "Time-block your calendar: Calls 9-11, Visits 11-3, Admin 3-5 ⏰",
    "Always carry 3 extra business cards and a sample with you 💼",
    "Friday afternoon = Best time for cold outreach. People are relaxed! 🍃",
    "Build a 'WIN journal' — write every deal/win, no matter how small 🏆",
    "Ask: 'On a scale of 1-10, how likely are you to order?' Then ask 'What would make it a 10?' 🎯",
    "LinkedIn: Connect with 5 potential clients every day 🔗",
    "Send case studies of similar companies you've helped 📊",
    "Create urgency: Limited time offers drive faster decisions ⏳",
    "Visit your best client and ask what you can improve 🔍",
    "Morning exercise = better sales performance. Start with 10 min! 🏃",
    "Track your win rate monthly. Aim to improve by 5% each quarter 📈",
    "Use WhatsApp Status to showcase products — clients ARE watching! 👀",
    "Batch similar tasks: All calls together, all emails together 📋",
    "The best follow-up: 'I saw this and thought of you' + relevant article 💡",
    "Create video demos of your products — send via WhatsApp 🎬"
];

// ---- Challenges ----
const CHALLENGES = {
    0: ['Write a full 1-paragraph week reflection', 'Set 3 personal goals for next week', 'Call a family member and share your week', 'Meditate for 10 minutes'],
    1: ['Set 5 targets and hit all of them', 'Make your first call before 9:30 AM', 'Connect with 3 brand new prospects', 'Create a weekly planner'],
    2: ['Collect at least 1 pending payment', 'Calculate your weekly ROI', 'Send 5 quotations today', 'Review all outstanding invoices'],
    3: ['Visit 3 client sites today', 'Learn one new industry term', 'Read 1 business article', 'Attend a networking event'],
    4: ['Complete ALL morning plan tasks', 'Make 10 extra calls', 'Send all pending proposals', 'Zero inbox by end of day'],
    5: ['Send 3 quotations before lunch', 'Close at least 1 deal', 'Send thank-you to best client', 'Beat your daily call record'],
    6: ['Create follow-up list of 10+ clients', 'Organize your contact database', 'Plan next week hour by hour', 'Clean and organize workspace']
};

// ---- Question Bank ----
const FIXED_MORNING = [
    { key: 'important_task', q: "What is today's #1 most important task? 🎯", ph: "e.g., Close the deal with ABC Corp" },
    { key: 'markets', q: "Which markets/areas will you cover today? 📊", ph: "e.g., IT sector, Bandra" },
    { key: 'start_time', q: "What time will you start your first productive task? ⏰", ph: "e.g., 9:30 AM" }
];

const DAY_MORNING = {
    0: [ // SUNDAY
        [
            { key: 'sun_m1', q: "What was your biggest achievement this past week? 🏆" },
            { key: 'sun_m2', q: "Rate your happiness this week (1-10). What would make it a 10? 😊" },
            { key: 'sun_m3', q: "What is your 1-year business goal? Are you on track? 🎯" },
            { key: 'sun_m4', q: "What made you smile this week? Share one happy moment 😄" }
        ],
        [
            { key: 'sun_m5', q: "What mistake did you make last week that you can learn from? 📝" },
            { key: 'sun_m6', q: "If you could redo one day from last week, which day and why? 🔄" },
            { key: 'sun_m7', q: "Where do you see your business in 5 years? 🚀" },
            { key: 'sun_m8', q: "What personal habit would you like to build this month? 💪" }
        ],
        [
            { key: 'sun_m9', q: "Which client relationship grew strongest this week? 🤝" },
            { key: 'sun_m10', q: "What is one thing you're grateful for in your work? 🙏" },
            { key: 'sun_m11', q: "What's your 3-month financial target? How close are you? 💰" },
            { key: 'sun_m12', q: "Did you spend quality time with family this week? How? ❤️" }
        ],
        [
            { key: 'sun_m13', q: "What skill did you improve this past week? 📚" },
            { key: 'sun_m14', q: "What would your ideal work-life balance look like? ⚖️" },
            { key: 'sun_m15', q: "Write down your top 3 long-term dreams 🌟" },
            { key: 'sun_m16', q: "How is your health? What will you do to stay fit? 🏃" }
        ]
    ],
    1: [ // MONDAY
        [
            { key: 'mon_m1', q: "How many new clients will you target this week? 🎯" },
            { key: 'mon_m2', q: "What is your revenue target for this week? 💰" },
            { key: 'mon_m3', q: "Which industry/sector will you focus on this week? 🏭" },
            { key: 'mon_m4', q: "Name 3 clients you MUST connect with today 📞" }
        ],
        [
            { key: 'mon_m5', q: "What is your quotation target for this week? 📋" },
            { key: 'mon_m6', q: "Which area/location will you cover today? 📍" },
            { key: 'mon_m7', q: "What product/service will you push hard this week? 🛒" },
            { key: 'mon_m8', q: "What's your daily call target? Set a minimum number 📞" }
        ],
        [
            { key: 'mon_m9', q: "Name the top 3 hot leads you'll chase this week 🔥" },
            { key: 'mon_m10', q: "What is one deal you want to close this week? 🤝" },
            { key: 'mon_m11', q: "Which competitor's client will you try to approach? ⚔️" },
            { key: 'mon_m12', q: "What's the biggest opportunity in your pipeline? 💎" }
        ],
        [
            { key: 'mon_m13', q: "Set a target: How many site visits this week? 🚗" },
            { key: 'mon_m14', q: "What skill will make you a better salesman this week? 📚" },
            { key: 'mon_m15', q: "Name one client who needs special attention this week 🌟" },
            { key: 'mon_m16', q: "What will you do differently from last Monday? 🔄" }
        ]
    ],
    2: [ // TUESDAY
        [
            { key: 'tue_m1', q: "What is your total outstanding amount from clients? 💰" },
            { key: 'tue_m2', q: "Which strategy will you use to close pending deals? 🧠" },
            { key: 'tue_m3', q: "How many quotations are pending response? Follow up! 📋" },
            { key: 'tue_m4', q: "What's your profit margin on your best product? Know your numbers! 📊" }
        ],
        [
            { key: 'tue_m5', q: "List your top 3 revenue-generating clients this month 💎" },
            { key: 'tue_m6', q: "What pricing strategy will you try today? 🏷️" },
            { key: 'tue_m7', q: "How much payment collection is pending? Plan recovery 💸" },
            { key: 'tue_m8', q: "What's your conversion rate? (Quotations to Orders) 📈" }
        ],
        [
            { key: 'tue_m9', q: "Which cost can you reduce in your business this month? ✂️" },
            { key: 'tue_m10', q: "What upselling opportunity exists with current clients? 📦" },
            { key: 'tue_m11', q: "How does your pricing compare to competitors? 🔍" },
            { key: 'tue_m12', q: "What's the ROI on your biggest recent deal? 🧮" }
        ],
        [
            { key: 'tue_m13', q: "Set a payment collection target for this week 💰" },
            { key: 'tue_m14', q: "Which client can give you a bulk/repeat order? 📦" },
            { key: 'tue_m15', q: "What new pricing or bundling strategy can you test? 💡" },
            { key: 'tue_m16', q: "Review: Are your expenses under control this month? 📉" }
        ]
    ],
    3: [ // WEDNESDAY
        [
            { key: 'wed_m1', q: "Which client sites will you visit today? List them 🚗" },
            { key: 'wed_m2', q: "What networking event or meeting can you attend? 🤝" },
            { key: 'wed_m3', q: "What new skill or topic will you learn today? 📚" },
            { key: 'wed_m4', q: "Plan something fun! What will you do for yourself today? 🎨" }
        ],
        [
            { key: 'wed_m5', q: "Which market/exhibition/trade show is happening nearby? 🏪" },
            { key: 'wed_m6', q: "Name 3 people outside work you want to connect with 👥" },
            { key: 'wed_m7', q: "What book/article/video will you consume today? 📖" },
            { key: 'wed_m8', q: "Any personal errands or health checkups to complete? 🏥" }
        ],
        [
            { key: 'wed_m9', q: "Plan a surprise visit to a potential client today! Who? 🎯" },
            { key: 'wed_m10', q: "What hobby or sport will you practice today? ⚽" },
            { key: 'wed_m11', q: "Attend a workshop or webinar today — which one? 💻" },
            { key: 'wed_m12', q: "Visit a new area/market you haven't explored before 🗺️" }
        ],
        [
            { key: 'wed_m13', q: "Schedule a lunch meeting with a key contact. Who? 🍽️" },
            { key: 'wed_m14', q: "What creativity exercise will you do today? 🎨" },
            { key: 'wed_m15', q: "Research a new product or technology in your field 🔬" },
            { key: 'wed_m16', q: "Spend time mentoring someone or getting mentored today 🎓" }
        ]
    ],
    4: [ // THURSDAY
        [
            { key: 'thu_m1', q: "What pending task MUST be completed today? No excuses! ⚡" },
            { key: 'thu_m2', q: "Which quotation needs to be converted into an order? 📋" },
            { key: 'thu_m3', q: "What process can you speed up or simplify today? 🏃" },
            { key: 'thu_m4', q: "Name one thing you've been procrastinating — do it today! 💥" }
        ],
        [
            { key: 'thu_m5', q: "What follow-up call have you been delaying? Do it NOW! 📞" },
            { key: 'thu_m6', q: "Which client delivery or commitment is pending? 📦" },
            { key: 'thu_m7', q: "Set a mini-deadline: What will be DONE by 2 PM today? ⏰" },
            { key: 'thu_m8', q: "What's blocking your biggest deal? Remove that blocker! 🧱" }
        ],
        [
            { key: 'thu_m9', q: "List 5 actions you will COMPLETE today (not start, COMPLETE) ✅" },
            { key: 'thu_m10', q: "Which email/proposal have you been delaying? Send it! 📧" },
            { key: 'thu_m11', q: "What can you delegate to save time for important work? 🤝" },
            { key: 'thu_m12', q: "Challenge: Make 10 more calls than your daily target 📞" }
        ],
        [
            { key: 'thu_m13', q: "What 80/20 rule applies today? Focus on the 20% that matters 🎯" },
            { key: 'thu_m14', q: "Which system/process needs improvement? Fix it today! 🔧" },
            { key: 'thu_m15', q: "Set a timer: 2 hours of distraction-free deep work. On what? ⏳" },
            { key: 'thu_m16', q: "What would your boss/mentor say you should focus on today? 🧠" }
        ]
    ],
    5: [ // FRIDAY
        [
            { key: 'fri_m1', q: "What must you close/finish before this week ends? ⏰" },
            { key: 'fri_m2', q: "Which client needs a last-minute push today? 📞" },
            { key: 'fri_m3', q: "How close are you to your weekly targets? What's the gap? 📊" },
            { key: 'fri_m4', q: "What will make you feel 'This was a GREAT week'? 🏆" }
        ],
        [
            { key: 'fri_m5', q: "Any pending quotation that can convert today? Chase it! 🏃" },
            { key: 'fri_m6', q: "Make today count: What 3 things will you finish? ✅" },
            { key: 'fri_m7', q: "Who can you call to get a last-minute order? 💰" },
            { key: 'fri_m8', q: "Send a thank-you message to your best client this week 🙏" }
        ],
        [
            { key: 'fri_m9', q: "What order/deal can still be closed by end of day? 🤝" },
            { key: 'fri_m10', q: "Clear your pending emails and messages today 📧" },
            { key: 'fri_m11', q: "Plan a strong close: What action will finish your week on a high? 🔥" },
            { key: 'fri_m12', q: "What report or documentation needs to be completed? 📄" }
        ],
        [
            { key: 'fri_m13', q: "Push one step further than your comfort zone today 💪" },
            { key: 'fri_m14', q: "Write down your proudest achievement this week 🏆" },
            { key: 'fri_m15', q: "Make one call that scares you. Which big client? 🎯" },
            { key: 'fri_m16', q: "How will you celebrate finishing this week? 🎉" }
        ]
    ],
    6: [ // SATURDAY
        [
            { key: 'sat_m1', q: "List all clients to follow up next week (names & details) 📝" },
            { key: 'sat_m2', q: "Which pending quotation needs the most attention? 📋" },
            { key: 'sat_m3', q: "What market intelligence did you gather this week? 🔍" },
            { key: 'sat_m4', q: "What material/samples/docs need to be prepared for next week? 📦" }
        ],
        [
            { key: 'sat_m5', q: "Name 5 clients to call first thing Monday morning 📞" },
            { key: 'sat_m6', q: "Which areas/locations will you visit next week? Plan the route 🗺️" },
            { key: 'sat_m7', q: "Any quotations to revise or resend? List them 📋" },
            { key: 'sat_m8', q: "What new leads came in this week? Organize them 📊" }
        ],
        [
            { key: 'sat_m9', q: "Create a priority list: A (hot), B (warm), C (cold) clients 🔥" },
            { key: 'sat_m10', q: "What presentation/proposal needs updating? 💻" },
            { key: 'sat_m11', q: "Which competitor activity did you notice this week? 👀" },
            { key: 'sat_m12', q: "Plan your Monday outfit and morning routine 👔" }
        ],
        [
            { key: 'sat_m13', q: "Review your CRM/contact list — any data to update? 📱" },
            { key: 'sat_m14', q: "What pending payment needs follow-up next week? 💰" },
            { key: 'sat_m15', q: "Set next week's daily schedule (time blocks) ⏰" },
            { key: 'sat_m16', q: "What goal felt impossible this month that now feels closer? 🌟" }
        ]
    ]
};

const FIXED_EVENING = [
    { key: 'plan_check', q: "Did you complete your #1 task from this morning?", type: 'plan_check' },
    { key: 'day_mood', q: "How was your day today? 🌟", type: 'mood' },
    { key: 'total_calls', q: "How many calls did you make today? 📞", type: 'number' },
    { key: 'followup_clients', q: "How many follow-up clients did you contact? 🔄", type: 'number' },
    { key: 'new_clients', q: "How many new clients did you connect with? 🤝", type: 'number' },
    { key: 'quotations_sent', q: "How many quotations did you send today? 📋", type: 'number' },
    { key: 'day_description', q: "Describe your day in short ✍️", type: 'text', ph: "Share your highlights..." },
    { key: 'tomorrow_task', q: "What's tomorrow's most important task? 📌", type: 'text', ph: "e.g., Meeting with XYZ at 10 AM" }
];

const DAY_EVENING = {
    0: [ // SUNDAY
        [{ key: 'sun_e1', q: "What are your top 3 goals for the coming week? 📋", type: 'text' }, { key: 'sun_e2', q: "One thing you want to STOP doing next week? 🚫", type: 'text' }],
        [{ key: 'sun_e3', q: "What new strategy will you try next week? 💡", type: 'text' }, { key: 'sun_e4', q: "Rate your work-life balance this week (1-10) ⚖️", type: 'rating' }],
        [{ key: 'sun_e5', q: "How will you reward yourself for this week's efforts? 🎁", type: 'text' }, { key: 'sun_e6', q: "What's one area you need to ask for help in? 🤲", type: 'text' }],
        [{ key: 'sun_e7', q: "Are you happy with your progress this month? Why? 🎯", type: 'text' }, { key: 'sun_e8', q: "What are you most excited about for next week? 🔥", type: 'text' }]
    ],
    1: [ // MONDAY
        [{ key: 'mon_e1', q: "Did you set all your weekly targets? List them 📝", type: 'text' }, { key: 'mon_e2', q: "How energetic do you feel about this week? (1-10) ⚡", type: 'rating' }],
        [{ key: 'mon_e3', q: "What's your plan to beat last week's numbers? 📈", type: 'text' }, { key: 'mon_e4', q: "Name tomorrow's first 3 action items 🎯", type: 'text' }],
        [{ key: 'mon_e5', q: "Did you reach today's call target? If not, why? 📞", type: 'text' }, { key: 'mon_e6', q: "What obstacle might block your week? Plan to overcome it 🧱", type: 'text' }],
        [{ key: 'mon_e7', q: "How confident are you about this week's targets? (1-10) 💪", type: 'rating' }, { key: 'mon_e8', q: "What motivated you the most today? 🔥", type: 'text' }]
    ],
    2: [ // TUESDAY
        [{ key: 'tue_e1', q: "How much revenue did you generate/confirm today? 💰", type: 'number' }, { key: 'tue_e2', q: "What was your smartest business move today? 🧠", type: 'text' }],
        [{ key: 'tue_e3', q: "Any payments collected today? Amount? 💸", type: 'number' }, { key: 'tue_e4', q: "Did your strategy work? What needs adjusting? 🔄", type: 'text' }],
        [{ key: 'tue_e5', q: "What deal is closest to closing? What's needed? 🤝", type: 'text' }, { key: 'tue_e6', q: "What financial mistake should you avoid this month? ⚠️", type: 'text' }],
        [{ key: 'tue_e7', q: "Rate your strategic thinking today (1-10) 🧠", type: 'rating' }, { key: 'tue_e8', q: "One number you must improve next week? 📊", type: 'text' }]
    ],
    3: [ // WEDNESDAY
        [{ key: 'wed_e1', q: "How many sites/clients did you visit today? 🚗", type: 'number' }, { key: 'wed_e2', q: "What new thing did you learn today? Share it! 📚", type: 'text' }],
        [{ key: 'wed_e3', q: "Did you meet anyone interesting today? Who? 🤝", type: 'text' }, { key: 'wed_e4', q: "Rate your personal growth today (1-10) 🌱", type: 'rating' }],
        [{ key: 'wed_e5', q: "What inspired you today? 💡", type: 'text' }, { key: 'wed_e6', q: "Any new business opportunity discovered during visits? 🔍", type: 'text' }],
        [{ key: 'wed_e7', q: "How refreshed do you feel after today? (1-10) 🔋", type: 'rating' }, { key: 'wed_e8', q: "One fun fact or insight from today? 🧠", type: 'text' }]
    ],
    4: [ // THURSDAY
        [{ key: 'thu_e1', q: "Did you complete your #1 task? If not, why? ✅", type: 'text' }, { key: 'thu_e2', q: "Rate your execution power today (1-10) ⚡", type: 'rating' }],
        [{ key: 'thu_e3', q: "What did you FINISH today? 🏁", type: 'text' }, { key: 'thu_e4', q: "What distracted you the most today? How to avoid it? 🚫", type: 'text' }],
        [{ key: 'thu_e5', q: "How many of your 5 actions did you complete? ✅", type: 'number' }, { key: 'thu_e6', q: "What will you implement better tomorrow? 🔄", type: 'text' }],
        [{ key: 'thu_e7', q: "Did you do your deep work session? What was the result? 🧠", type: 'text' }, { key: 'thu_e8', q: "One thing you executed perfectly today? 🎯", type: 'text' }]
    ],
    5: [ // FRIDAY
        [{ key: 'fri_e1', q: "Rate your overall week performance (1-10) 📊", type: 'rating' }, { key: 'fri_e2', q: "What's the #1 thing you're proud of this week? 🏆", type: 'text' }],
        [{ key: 'fri_e3', q: "Did you hit your weekly targets? Which ones? ✅", type: 'text' }, { key: 'fri_e4', q: "What will you do better next week? 🔄", type: 'text' }],
        [{ key: 'fri_e5', q: "One word to describe your week? 💭", type: 'text' }, { key: 'fri_e6', q: "Weekend plan: Rest or hustle? What's the plan? 🏖️", type: 'text' }],
        [{ key: 'fri_e7', q: "What unfinished business carries to next week? 📋", type: 'text' }, { key: 'fri_e8', q: "Did you end the week stronger than you started? 💪", type: 'text' }]
    ],
    6: [ // SATURDAY
        [{ key: 'sat_e1', q: "Is your follow-up list ready for Monday? 📝", type: 'text' }, { key: 'sat_e2', q: "Rate your preparation for next week (1-10) 📊", type: 'rating' }],
        [{ key: 'sat_e3', q: "One thing you'll try for the first time next week? 🆕", type: 'text' }, { key: 'sat_e4', q: "How organized is your workspace right now? (1-10) 🗂️", type: 'rating' }],
        [{ key: 'sat_e5', q: "Did you plan something fun for the weekend? 🎉", type: 'text' }, { key: 'sat_e6', q: "What's your #1 priority for next Monday? 🎯", type: 'text' }],
        [{ key: 'sat_e7', q: "Are you ready to crush next week? Rate excitement (1-10) 🔥", type: 'rating' }, { key: 'sat_e8', q: "End-of-month reflection: What grade do you give yourself? 📝", type: 'text' }]
    ]
};

// ---- XP Levels ----
const LEVELS = [
    { level: 1, title: 'Beginner', xp: 0 },
    { level: 2, title: 'Hustler', xp: 200 },
    { level: 3, title: 'Go-Getter', xp: 500 },
    { level: 4, title: 'Closer', xp: 1000 },
    { level: 5, title: 'Deal Maker', xp: 2000 },
    { level: 6, title: 'Sales Pro', xp: 3500 },
    { level: 7, title: 'Sales Warrior', xp: 5000 },
    { level: 8, title: 'Market King', xp: 8000 },
    { level: 9, title: 'Business Legend', xp: 12000 },
    { level: 10, title: 'Industry Titan 👑', xp: 20000 }
];

const XP_VALUES = {
    morning_complete: 10,
    evening_complete: 10,
    per_call: 0.5,
    per_new_client: 3,
    per_quotation: 4,
    streak_bonus: 5,
    challenge_complete: 25,
    perfect_mood: 10,
    plan_done: 15,
    plan_partial: 5
};

const BADGES = [
    { id: 'first_session', emoji: '🔥', name: 'Fire Starter', desc: 'Complete your first session', check: (g) => g.totalEntries >= 1 },
    { id: 'calls_100', emoji: '📞', name: 'Call Machine', desc: 'Make 100 total calls', check: (g) => g.totalCalls >= 100 },
    { id: 'calls_500', emoji: '📞', name: 'Phone Warrior', desc: 'Make 500 total calls', check: (g) => g.totalCalls >= 500 },
    { id: 'clients_50', emoji: '🤝', name: 'Connector', desc: 'Connect with 50 new clients', check: (g) => g.totalClients >= 50 },
    { id: 'quotes_100', emoji: '📋', name: 'Quote Master', desc: 'Send 100 quotations', check: (g) => g.totalQuotes >= 100 },
    { id: 'streak_7', emoji: '🔥', name: 'Week Warrior', desc: '7-day streak', check: (g) => g.streak >= 7 },
    { id: 'streak_30', emoji: '🔥', name: 'Monthly Champion', desc: '30-day streak', check: (g) => g.streak >= 30 },
    { id: 'streak_100', emoji: '💎', name: 'Unstoppable', desc: '100-day streak', check: (g) => g.streak >= 100 },
    { id: 'perfect_day', emoji: '⭐', name: 'Perfect Day', desc: 'Score Very Happy mood', check: (g) => g.hadPerfectDay },
    { id: 'level_5', emoji: '🏆', name: 'Pro Status', desc: 'Reach Level 5', check: (g) => g.level >= 5 },
    { id: 'level_10', emoji: '👑', name: 'Industry Titan', desc: 'Reach Level 10', check: (g) => g.level >= 10 },
    { id: 'entries_50', emoji: '📝', name: 'Journal Keeper', desc: 'Log 50 entries', check: (g) => g.totalEntries >= 50 },
    { id: 'entries_200', emoji: '📖', name: 'Diary Master', desc: 'Log 200 entries', check: (g) => g.totalEntries >= 200 },
    { id: 'calls_day_20', emoji: '💪', name: 'Power Caller', desc: '20+ calls in one day', check: (g) => g.recordCalls >= 20 },
    { id: 'plan_complete', emoji: '🎯', name: 'Sniper', desc: 'Complete morning plan fully', check: (g) => g.hadPlanComplete }
];

// ---- Session variables ----
let mQuestions = [];
let mStep = 0;
let mAnswers = {};

let eQuestions = [];
let eStep = 0;
let eAnswers = {};

// ---- Lifecycle & Setup ----
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    applyTheme();
    initClock();
    initNavigation();
    initHomeWidgets();
    initSessionFlows();
    initSettingsView();
    initAnalyticsView();
    initAchievementsView();
    initJournalView();
    initPWAInstall();

    // Fade out splash
    setTimeout(() => {
        const splash = $('#splash');
        if (splash) {
            splash.classList.add('hide');
            setTimeout(() => {
                splash.style.display = 'none';
                $('#app').style.display = 'flex';
            }, 600);
        }
    }, 2200);
});

// ---- Load / Save Data ----
function loadAllData() {
    try {
        const localEntries = localStorage.getItem(ENTRIES_KEY);
        if (localEntries) entries = JSON.parse(localEntries);

        const localSettings = localStorage.getItem(SETTINGS_KEY);
        if (localSettings) settings = { ...settings, ...JSON.parse(localSettings) };

        const localGame = localStorage.getItem(GAME_KEY);
        if (localGame) gameState = { ...gameState, ...JSON.parse(localGame) };
    } catch (e) {
        console.error("Data load failed", e);
    }
}

function saveAllData() {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem(GAME_KEY, JSON.stringify(gameState));
}

// ---- Themes & Clock ----
function applyTheme() {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
    const setDark = $('#set-dark');
    if (setDark) setDark.checked = settings.darkMode;
}

function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    const heroTime = $('#hero-time');
    if (heroTime) heroTime.textContent = `${displayHours}:${minutes} ${ampm}`;

    const heroDate = $('#hero-date');
    if (heroDate) heroDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    let greeting = "Good Afternoon!";
    if (hours < 12) greeting = "Good Morning!";
    else if (hours >= 17 && hours < 21) greeting = "Good Evening!";
    else if (hours >= 21) greeting = "Good Night!";

    const nameText = settings.name ? `, ${settings.name}` : "";
    const heroGreet = $('#hero-greet');
    if (heroGreet) heroGreet.textContent = `${greeting}${nameText} 🚀`;
}

// ---- Navigation ----
function initNavigation() {
    $$('.bnav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const screenId = btn.dataset.s;
            switchScreen(screenId);
        });
    });

    const btnSettings = $('#btn-settings');
    if (btnSettings) {
        btnSettings.addEventListener('click', () => switchScreen('settings'));
    }

    const backSettings = $('#back-settings');
    if (backSettings) {
        backSettings.addEventListener('click', () => switchScreen('home'));
    }

    const backMorning = $('#back-morning');
    if (backMorning) {
        backMorning.addEventListener('click', () => {
            if (confirm("Cancel morning planning? Progress will be lost.")) {
                switchScreen('home');
            }
        });
    }

    const backEvening = $('#back-evening');
    if (backEvening) {
        backEvening.addEventListener('click', () => {
            if (confirm("Cancel evening review? Progress will be lost.")) {
                switchScreen('home');
            }
        });
    }
}

function switchScreen(screenId) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $(`#s-${screenId}`).classList.add('active');

    // Update bottom nav active state
    $$('.bnav-btn').forEach(btn => {
        if (btn.dataset.s === screenId) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Hide navigation bar on session screens
    const bnav = $('#bnav');
    if (bnav) {
        if (screenId === 'morning' || screenId === 'evening') {
            bnav.style.display = 'none';
        } else {
            bnav.style.display = 'flex';
        }
    }

    // Refresh view states
    if (screenId === 'home') refreshHomeScreen();
    if (screenId === 'analytics') refreshAnalyticsScreen();
    if (screenId === 'achieve') refreshAchievementsScreen();
    if (screenId === 'journal') refreshJournalScreen();
}

// ---- Home widgets ----
function initHomeWidgets() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);

    // Tip
    const tipIndex = dayOfYear % TIPS.length;
    const tipCard = $('#tip-card p');
    if (tipCard) tipCard.textContent = TIPS[tipIndex];

    // Quote
    const quoteIndex = dayOfYear % QUOTES.length;
    const quoteText = $('#quote-text');
    const quoteAuthor = $('#quote-author');
    if (quoteText) quoteText.textContent = `"${QUOTES[quoteIndex].text}"`;
    if (quoteAuthor) quoteAuthor.textContent = `— ${QUOTES[quoteIndex].author}`;

    // Challenge
    const dayOfWeek = today.getDay();
    const weekIndex = Math.floor(dayOfYear / 7) % 4;
    const challengePool = CHALLENGES[dayOfWeek] || CHALLENGES[1];
    const currentChallenge = challengePool[weekIndex % challengePool.length];
    const challengeText = $('#challenge-card p');
    if (challengeText) challengeText.textContent = currentChallenge;

    // Challenge Accept Button
    const acceptBtn = $('#challenge-accept');
    if (acceptBtn) {
        const todayKey = getTodayKey();
        if (gameState.challengeAccepted === todayKey) {
            acceptBtn.textContent = gameState.challengeCompleted === todayKey ? "Challenge Completed! 🎉" : "Challenge Accepted! 🎯";
            acceptBtn.disabled = true;
        } else {
            acceptBtn.addEventListener('click', () => {
                gameState.challengeAccepted = todayKey;
                saveAllData();
                acceptBtn.textContent = "Challenge Accepted! 🎯";
                acceptBtn.disabled = true;
                awardXP(5);
            });
        }
    }

    refreshHomeScreen();
}

function refreshHomeScreen() {
    const todayKey = getTodayKey();

    // Streak and XP display
    const streakNum = $('#qs-streak');
    if (streakNum) streakNum.textContent = gameState.streak;

    const streakFire = $('#qs-fire');
    if (streakFire) {
        if (gameState.streak > 0) {
            streakFire.classList.add('fire-glow');
        } else {
            streakFire.classList.remove('fire-glow');
        }
    }

    const xpNum = $('#qs-xp');
    if (xpNum) xpNum.textContent = gameState.xp;

    // Check today's entry status
    const morningEntry = entries.find(e => e.date === todayKey && e.type === 'morning');
    const eveningEntry = entries.find(e => e.date === todayKey && e.type === 'evening');

    const morningStatus = $('#morning-status');
    if (morningStatus) {
        if (morningEntry) {
            morningStatus.textContent = "Done ✓";
            morningStatus.classList.add('completed');
        } else {
            morningStatus.textContent = "Start →";
            morningStatus.classList.remove('completed');
        }
    }

    const eveningStatus = $('#evening-status');
    if (eveningStatus) {
        if (eveningEntry) {
            eveningStatus.textContent = "Done ✓";
            eveningStatus.classList.add('completed');
        } else {
            eveningStatus.textContent = "Start →";
            eveningStatus.classList.remove('completed');
        }
    }

    // Power score display
    const powerNum = $('#qs-power');
    if (powerNum) {
        if (eveningEntry && eveningEntry.powerScore !== null) {
            powerNum.textContent = eveningEntry.powerScore;
        } else {
            powerNum.textContent = '--';
        }
    }

    // Theme label
    const dayOfWeek = new Date().getDay();
    const morningThemeLabel = $('#morning-theme-label');
    if (morningThemeLabel && DAY_THEMES[dayOfWeek]) {
        morningThemeLabel.textContent = `${DAY_THEMES[dayOfWeek].icon} Theme: ${DAY_THEMES[dayOfWeek].name}`;
    }

    // Show/hide plan preview
    const previewContainer = $('#plan-preview');
    const previewContent = $('#plan-preview-content');
    if (previewContainer && previewContent) {
        if (morningEntry) {
            previewContainer.style.display = 'block';
            previewContent.innerHTML = `
                <div class="pv-item"><span class="pv-label">🎯 Main Task</span><span class="pv-value">${escapeHTML(morningEntry.answers.important_task || '')}</span></div>
                <div class="pv-item"><span class="pv-label">🏭 Markets</span><span class="pv-value">${escapeHTML(morningEntry.answers.markets || '')}</span></div>
                <div class="pv-item"><span class="pv-label">⏰ Start Time</span><span class="pv-value">${escapeHTML(morningEntry.answers.start_time || '')}</span></div>
            `;
        } else {
            previewContainer.style.display = 'none';
        }
    }

    updateTopbarLevel();
}

function updateTopbarLevel() {
    const curLevelObj = LEVELS[gameState.level - 1] || LEVELS[0];
    const nextLevelObj = LEVELS[gameState.level] || LEVELS[LEVELS.length - 1];

    const topbarLvlBadge = $('#topbar-level .level-badge');
    if (topbarLvlBadge) topbarLvlBadge.textContent = `Lv.${gameState.level}`;

    const xpBarFill = $('#xp-mini-fill');
    if (xpBarFill) {
        const curLevelXP = curLevelObj.xp;
        const nextLevelXP = nextLevelObj.xp;
        const xpProgress = gameState.xp - curLevelXP;
        const range = nextLevelXP - curLevelXP;
        const pct = range > 0 ? Math.min(100, Math.max(0, (xpProgress / range) * 100)) : 100;
        xpBarFill.style.width = `${pct}%`;
    }
}

// ---- Gamification Engine ----
function awardXP(amount) {
    gameState.xp += amount;
    checkLevelUp();
    saveAllData();
    updateTopbarLevel();
}

function checkLevelUp() {
    let currentLevel = gameState.level;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (gameState.xp >= LEVELS[i].xp) {
            currentLevel = LEVELS[i].level;
            break;
        }
    }

    if (currentLevel > gameState.level) {
        gameState.level = currentLevel;
        showLevelUpModal(currentLevel);
    }
}

function checkAndAwardBadges() {
    let unlockedAny = false;
    BADGES.forEach(badge => {
        if (!gameState.badges.includes(badge.id)) {
            if (badge.check(gameState)) {
                gameState.badges.push(badge.id);
                showBadgeUnlockModal(badge);
                unlockedAny = true;
            }
        }
    });
    if (unlockedAny) saveAllData();
}

function calculateStreakCount() {
    if (!gameState.lastEntryDate) {
        gameState.streak = 0;
        return;
    }

    const today = new Date();
    const lastDate = new Date(gameState.lastEntryDate);

    // Calculate difference in days
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
        // Streak continues
        gameState.streak += 1;
        if (gameState.streak > gameState.longestStreak) {
            gameState.longestStreak = gameState.streak;
        }
    } else {
        // Streak broken
        gameState.streak = 1;
    }

    gameState.lastEntryDate = getTodayKey();
    saveAllData();
}

// ---- Session flows ----
function initSessionFlows() {
    // Start morning
    $('#btn-morning').addEventListener('click', () => {
        const todayKey = getTodayKey();
        const existing = entries.find(e => e.date === todayKey && e.type === 'morning');
        if (existing) {
            if (!confirm("Overwrite today's morning planning?")) return;
            entries = entries.filter(e => !(e.date === todayKey && e.type === 'morning'));
        }
        startMorningSession();
    });

    // Start evening
    $('#btn-evening').addEventListener('click', () => {
        const todayKey = getTodayKey();
        const existing = entries.find(e => e.date === todayKey && e.type === 'evening');
        if (existing) {
            if (!confirm("Overwrite today's evening review?")) return;
            entries = entries.filter(e => !(e.date === todayKey && e.type === 'evening'));
        }
        startEveningSession();
    });

    // Chat controls (Morning)
    const mSend = $('#m-send');
    const mInput = $('#m-input');
    mSend.addEventListener('click', submitMorningAnswer);
    mInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitMorningAnswer();
        }
    });

    // Auto-resize textareas
    [mInput, $('#e-input')].forEach(ta => {
        ta.addEventListener('input', () => {
            ta.style.height = 'auto';
            ta.style.height = `${ta.scrollHeight}px`;
        });
    });
}

function startMorningSession() {
    mAnswers = {};
    mStep = 0;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const rotationIndex = Math.floor(dayOfYear / 7) % 4;

    const daySpecificSet = DAY_MORNING[dayOfWeek] || DAY_MORNING[1];
    const rotating = daySpecificSet[rotationIndex % daySpecificSet.length];

    mQuestions = [...FIXED_MORNING, ...rotating];

    const chat = $('#morning-chat');
    chat.innerHTML = '';

    const morningTitle = $('#morning-title');
    const morningSubtitle = $('#morning-subtitle');
    if (morningTitle && DAY_THEMES[dayOfWeek]) {
        morningTitle.textContent = `${DAY_THEMES[dayOfWeek].icon} Morning Planning`;
        morningSubtitle.textContent = DAY_THEMES[dayOfWeek].tagline;
    }

    switchScreen('morning');
    askNextMorningQuestion();
}

function askNextMorningQuestion() {
    const chat = $('#morning-chat');
    const qObj = mQuestions[mStep];

    addChatMsg('morning-chat', qObj.q, 'bot', 'morning-bot');

    const mInput = $('#m-input');
    mInput.placeholder = qObj.ph || "Type your answer...";
    mInput.value = '';
    mInput.style.height = 'auto';
    mInput.focus();

    updateProgressBar('m', mStep, mQuestions.length);
}

function submitMorningAnswer() {
    const mInput = $('#m-input');
    const text = mInput.value.trim();
    if (!text) return;

    const qObj = mQuestions[mStep];
    mAnswers[qObj.key] = text;

    addChatMsg('morning-chat', text, 'user');

    mStep++;
    if (mStep < mQuestions.length) {
        addTypingDots('morning-chat');
        setTimeout(() => {
            removeTypingDots('morning-chat');
            askNextMorningQuestion();
        }, 800);
    } else {
        updateProgressBar('m', mQuestions.length, mQuestions.length);
        completeMorningSession();
    }
}

function completeMorningSession() {
    const todayKey = getTodayKey();
    const newEntry = {
        id: Date.now(),
        date: todayKey,
        type: 'morning',
        timestamp: new Date().toISOString(),
        answers: mAnswers,
        powerScore: null
    };

    entries.push(newEntry);
    gameState.totalEntries++;

    calculateStreakCount();
    awardXP(XP_VALUES.morning_complete);
    checkAndAwardBadges();
    saveAllData();

    showSessionCompleteModal('morning', newEntry, XP_VALUES.morning_complete);
}

function startEveningSession() {
    eAnswers = {};
    eStep = 0;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const rotationIndex = Math.floor(dayOfYear / 7) % 4;

    const daySpecificSet = DAY_EVENING[dayOfWeek] || DAY_EVENING[1];
    const rotating = daySpecificSet[rotationIndex % daySpecificSet.length];

    eQuestions = [...FIXED_EVENING, ...rotating];

    // Check morning plan
    const todayKey = getTodayKey();
    const morningEntry = entries.find(e => e.date === todayKey && e.type === 'morning');

    const comparePanel = $('#plan-compare');
    const compareItems = $('#plan-compare-items');
    if (comparePanel && compareItems) {
        if (morningEntry) {
            comparePanel.style.display = 'block';
            compareItems.innerHTML = `
                <div class="pc-item"><span>🎯 #1 Goal:</span><strong>${escapeHTML(morningEntry.answers.important_task || '')}</strong></div>
            `;
        } else {
            comparePanel.style.display = 'none';
        }
    }

    const chat = $('#evening-chat');
    chat.innerHTML = '';

    switchScreen('evening');
    askNextEveningQuestion();
}

function askNextEveningQuestion() {
    const chat = $('#evening-chat');
    const qObj = eQuestions[eStep];

    addChatMsg('evening-chat', qObj.q, 'bot', 'evening-bot');

    // Display correct input dock based on question type
    $('#mood-row').style.display = 'none';
    $('#rating-row').style.display = 'none';
    $('#num-row').style.display = 'none';
    $('#e-text-row').style.display = 'none';
    $('#plan-check-row').style.display = 'none';

    if (qObj.type === 'plan_check') {
        const planRow = $('#plan-check-row');
        planRow.style.display = 'flex';

        // Bind plan comparison buttons
        $$('.plan-chk-btn').forEach(btn => {
            btn.onclick = () => {
                const val = btn.dataset.val;
                submitEveningAnswer(val, btn.textContent);
            };
        });
    } else if (qObj.type === 'mood') {
        const moodRow = $('#mood-row');
        moodRow.style.display = 'flex';

        $$('.mood-btn').forEach(btn => {
            btn.onclick = () => {
                const val = btn.dataset.mood;
                submitEveningAnswer(val, btn.querySelector('.mood-em').textContent + ' ' + val);
            };
        });
    } else if (qObj.type === 'rating') {
        const ratingRow = $('#rating-row');
        const container = $('#rating-nums');
        container.innerHTML = '';
        ratingRow.style.display = 'block';

        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button');
            btn.className = 'rating-num';
            btn.textContent = i;
            btn.onclick = () => submitEveningAnswer(i, i.toString());
            container.appendChild(btn);
        }
    } else if (qObj.type === 'number') {
        const numRow = $('#num-row');
        numRow.style.display = 'flex';

        const numInput = $('#e-num');
        numInput.value = 0;
        numInput.focus();

        $('#num-minus').onclick = () => {
            let val = parseInt(numInput.value) || 0;
            if (val > 0) numInput.value = val - 1;
        };
        $('#num-plus').onclick = () => {
            let val = parseInt(numInput.value) || 0;
            numInput.value = val + 1;
        };

        $('#e-num-send').onclick = () => {
            const val = parseInt(numInput.value) || 0;
            submitEveningAnswer(val, val.toString());
        };
    } else {
        const textRow = $('#e-text-row');
        textRow.style.display = 'flex';

        const eInput = $('#e-input');
        eInput.placeholder = qObj.ph || "Type your answer...";
        eInput.value = '';
        eInput.style.height = 'auto';
        eInput.focus();

        $('#e-send').onclick = () => {
            const val = eInput.value.trim();
            if (val) submitEveningAnswer(val, val);
        };
    }

    updateProgressBar('e', eStep, eQuestions.length);
}

function submitEveningAnswer(value, displayText) {
    const qObj = eQuestions[eStep];
    eAnswers[qObj.key] = value;

    addChatMsg('evening-chat', displayText, 'user');

    eStep++;
    if (eStep < eQuestions.length) {
        // Transition to next input hide
        $('#mood-row').style.display = 'none';
        $('#rating-row').style.display = 'none';
        $('#num-row').style.display = 'none';
        $('#e-text-row').style.display = 'none';
        $('#plan-check-row').style.display = 'none';

        addTypingDots('evening-chat');
        setTimeout(() => {
            removeTypingDots('evening-chat');
            askNextEveningQuestion();
        }, 800);
    } else {
        updateProgressBar('e', eQuestions.length, eQuestions.length);
        completeEveningSession();
    }
}

function completeEveningSession() {
    const todayKey = getTodayKey();
    const newEntry = {
        id: Date.now(),
        date: todayKey,
        type: 'evening',
        timestamp: new Date().toISOString(),
        answers: eAnswers,
        powerScore: 0
    };

    // Calculate metrics
    const powerScore = calculatePowerScore(newEntry);
    newEntry.powerScore = powerScore;

    entries.push(newEntry);
    gameState.totalEntries++;

    // Calculate XP
    let xpEarned = XP_VALUES.evening_complete;

    // Numerical counts addition
    const calls = parseInt(eAnswers.total_calls) || 0;
    const clients = parseInt(eAnswers.new_clients) || 0;
    const quotes = parseInt(eAnswers.quotations_sent) || 0;
    const followups = parseInt(eAnswers.followup_clients) || 0;

    gameState.totalCalls += calls;
    gameState.totalClients += clients;
    gameState.totalQuotes += quotes;
    gameState.totalFollowups += followups;

    xpEarned += calls * XP_VALUES.per_call;
    xpEarned += clients * XP_VALUES.per_new_client;
    xpEarned += quotes * XP_VALUES.per_quotation;

    // Check challenge
    if (gameState.challengeAccepted === todayKey && gameState.challengeCompleted !== todayKey) {
        gameState.challengeCompleted = todayKey;
        xpEarned += XP_VALUES.challenge_complete;
    }

    // Check records
    let isNewRecord = false;
    if (calls > gameState.recordCalls) { gameState.recordCalls = calls; isNewRecord = true; }
    if (clients > gameState.recordClients) { gameState.recordClients = clients; isNewRecord = true; }
    if (quotes > gameState.recordQuotes) { gameState.recordQuotes = quotes; isNewRecord = true; }
    if (powerScore > gameState.recordPower) { gameState.recordPower = powerScore; isNewRecord = true; }

    if (eAnswers.day_mood === 'Very Happy') {
        gameState.hadPerfectDay = true;
        xpEarned += XP_VALUES.perfect_mood;
    }

    if (eAnswers.plan_check === 'done') {
        gameState.hadPlanComplete = true;
        xpEarned += XP_VALUES.plan_done;
    } else if (eAnswers.plan_check === 'partial') {
        xpEarned += XP_VALUES.plan_partial;
    }

    // Award XP and show modals
    awardXP(Math.round(xpEarned));
    checkAndAwardBadges();
    saveAllData();

    if (isNewRecord) {
        setTimeout(() => showNewRecordModal(), 1000);
    }

    showSessionCompleteModal('evening', newEntry, Math.round(xpEarned));
}

function calculatePowerScore(entry) {
    let score = 0;
    const calls = parseInt(entry.answers.total_calls) || 0;
    const clients = parseInt(entry.answers.new_clients) || 0;
    const quotes = parseInt(entry.answers.quotations_sent) || 0;
    const mood = entry.answers.day_mood;
    const plan = entry.answers.plan_check;

    // Calls (max 25 pts, target 20)
    score += Math.min(25, Math.round((calls / 20) * 25));

    // New Clients (max 20 pts, target 5)
    score += Math.min(20, Math.round((clients / 5) * 20));

    // Quotations (max 20 pts, target 5)
    score += Math.min(20, Math.round((quotes / 5) * 20));

    // Mood (max 15 pts)
    const moodMap = { 'Normal': 3, 'Good': 6, 'Very Good': 9, 'Excellent': 12, 'Very Happy': 15 };
    score += moodMap[mood] || 3;

    // Plan check (max 20 pts)
    const planMap = { 'done': 20, 'partial': 10, 'missed': 0 };
    score += planMap[plan] || 0;

    return score;
}

// ---- Chat helpers ----
function addChatMsg(containerId, text, type, extraClass = '') {
    const chat = $(`#${containerId}`);
    if (!chat) return;

    const div = document.createElement('div');
    div.className = `chat-msg ${type} ${extraClass}`;
    div.textContent = text;
    chat.appendChild(div);
    scrollChat(containerId);
}

function addTypingDots(containerId) {
    const chat = $(`#${containerId}`);
    if (!chat) return;

    const div = document.createElement('div');
    div.className = 'chat-msg bot typing';
    div.id = 'typing-indicator';
    div.innerHTML = `<span></span><span></span><span></span>`;
    chat.appendChild(div);
    scrollChat(containerId);
}

function removeTypingDots(containerId) {
    const indicator = $('#typing-indicator');
    if (indicator) indicator.remove();
}

function scrollChat(containerId) {
    const chat = $(`#${containerId}`);
    if (chat) {
        setTimeout(() => {
            chat.scrollTop = chat.scrollHeight;
        }, 50);
    }
}

function updateProgressBar(prefix, step, total) {
    const bar = $(`#${prefix}-prog`);
    const label = $(`#${prefix}-label`);
    if (bar && label) {
        const pct = (step / total) * 100;
        bar.style.width = `${pct}%`;
        label.textContent = step >= total ? "Completed!" : `Question ${step + 1} of ${total}`;
    }
}

// ---- Settings View ----
function initSettingsView() {
    const setDark = $('#set-dark');
    if (setDark) {
        setDark.addEventListener('change', () => {
            settings.darkMode = setDark.checked;
            saveAllData();
            applyTheme();
        });
    }

    const setName = $('#set-name');
    if (setName) {
        setName.value = settings.name;
        setName.addEventListener('input', () => {
            settings.name = setName.value.trim();
            saveAllData();
            updateClock();
        });
    }

    const setMTime = $('#set-mtime');
    const setETime = $('#set-etime');
    if (setMTime) {
        setMTime.value = settings.morningTime;
        setMTime.addEventListener('change', () => {
            settings.morningTime = setMTime.value;
            saveAllData();
        });
    }
    if (setETime) {
        setETime.value = settings.eveningTime;
        setETime.addEventListener('change', () => {
            settings.eveningTime = setETime.value;
            saveAllData();
        });
    }

    const setNotif = $('#set-notif');
    if (setNotif) {
        setNotif.checked = settings.notifications;
        setNotif.addEventListener('change', () => {
            settings.notifications = setNotif.checked;
            if (settings.notifications) {
                Notification.requestPermission();
            }
            saveAllData();
        });
    }
}

// ---- Analytics View ----
let currentPeriod = 'week';

function initAnalyticsView() {
    $$('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.dataset.period;
            refreshAnalyticsScreen();
        });
    });

    const exportBtn = $('#btn-export');
    if (exportBtn) exportBtn.addEventListener('click', exportToExcel);

    const exportCSV = $('#btn-export-csv');
    if (exportCSV) exportCSV.addEventListener('click', exportToCSV);
}

function refreshAnalyticsScreen() {
    let filtered = [...entries];
    const now = new Date();

    if (currentPeriod === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = entries.filter(e => new Date(e.timestamp) >= oneWeekAgo);
    } else if (currentPeriod === 'month') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = entries.filter(e => new Date(e.timestamp) >= oneMonthAgo);
    }

    const eveningEntries = filtered.filter(e => e.type === 'evening');

    // Totals calculations
    let totalCalls = 0;
    let totalClients = 0;
    let totalFollowups = 0;
    let totalQuotes = 0;

    eveningEntries.forEach(entry => {
        totalCalls += parseInt(entry.answers.total_calls) || 0;
        totalClients += parseInt(entry.answers.new_clients) || 0;
        totalFollowups += parseInt(entry.answers.followup_clients) || 0;
        totalQuotes += parseInt(entry.answers.quotations_sent) || 0;
    });

    $('#sc-calls').textContent = totalCalls;
    $('#sc-clients').textContent = totalClients;
    $('#sc-followups').textContent = totalFollowups;
    $('#sc-quotes').textContent = totalQuotes;

    // Render Calls Chart (last 7 days of evening entries)
    renderCallsChart();

    // Render Mood Chart
    renderMoodChart();

    // Rival Mode
    renderRivalMode();

    // Report Card
    renderReportCard();
}

function renderCallsChart() {
    const chart = $('#bar-chart-calls');
    if (!chart) return;
    chart.innerHTML = '';

    // Last 7 days
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        last7Days.push(formatDateKey(date));
    }

    let maxCalls = 5; // minimum scale
    const dayData = last7Days.map(dateKey => {
        const entry = entries.find(e => e.date === dateKey && e.type === 'evening');
        const calls = entry ? parseInt(entry.answers.total_calls) || 0 : 0;
        if (calls > maxCalls) maxCalls = calls;
        return {
            dayName: new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short' }),
            calls: calls
        };
    });

    dayData.forEach(day => {
        const pct = (day.calls / maxCalls) * 100;
        const col = document.createElement('div');
        col.className = 'bar-col';
        col.innerHTML = `
            <span class="bar-val">${day.calls}</span>
            <div class="bar-fill" style="height: ${pct}%"></div>
            <span class="bar-day">${day.dayName}</span>
        `;
        chart.appendChild(col);
    });
}

function renderMoodChart() {
    const chart = $('#mood-trend');
    if (!chart) return;
    chart.innerHTML = '';

    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        last7Days.push(formatDateKey(date));
    }

    last7Days.forEach(dateKey => {
        const entry = entries.find(e => e.date === dateKey && e.type === 'evening');
        const mood = entry ? entry.answers.day_mood : 'None';

        const moodEmojis = { 'Normal': '😐', 'Good': '🙂', 'Very Good': '😊', 'Excellent': '😄', 'Very Happy': '🤩', 'None': '➖' };
        const emoji = moodEmojis[mood] || '➖';

        const dayName = new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short' });

        const col = document.createElement('div');
        col.className = 'mt-day';
        col.innerHTML = `
            <span class="mt-emoji">${emoji}</span>
            <span class="mt-label">${dayName}</span>
        `;
        chart.appendChild(col);
    });
}

function renderRivalMode() {
    const grid = $('#rival-grid');
    const result = $('#rival-result');
    if (!grid || !result) return;

    // Calculate this week (last 7 days) and last week (prior 7 days)
    const now = new Date();
    const startOfThisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfLastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekEntries = entries.filter(e => e.type === 'evening' && new Date(e.timestamp) >= startOfThisWeek);
    const lastWeekEntries = entries.filter(e => e.type === 'evening' && new Date(e.timestamp) >= startOfLastWeek && new Date(e.timestamp) < startOfThisWeek);

    const getStats = (list) => {
        let calls = 0, clients = 0, quotes = 0;
        list.forEach(e => {
            calls += parseInt(e.answers.total_calls) || 0;
            clients += parseInt(e.answers.new_clients) || 0;
            quotes += parseInt(e.answers.quotations_sent) || 0;
        });
        return { calls, clients, quotes };
    };

    const cur = getStats(thisWeekEntries);
    const prev = getStats(lastWeekEntries);

    const compare = (val1, val2, label) => {
        const diff = val1 - val2;
        const winner = diff > 0 ? 'win' : (diff < 0 ? 'lose' : 'draw');
        const text = diff > 0 ? `▲ +${diff}` : (diff < 0 ? `▼ ${diff}` : '➖ 0');
        const pillClass = winner === 'win' ? 'win' : (winner === 'lose' ? 'lose' : 'draw');

        return `
            <div class="rv-row">
                <span class="rv-label">${label}</span>
                <span>${val1} <span class="rv-vs">vs</span> ${val2}</span>
                <span class="rv-result ${pillClass}">${text}</span>
            </div>
        `;
    };

    grid.innerHTML = `
        ${compare(cur.calls, prev.calls, '📞 Calls')}
        ${compare(cur.clients, prev.clients, '🤝 New Clients')}
        ${compare(cur.quotes, prev.quotes, '📋 Quotations')}
    `;

    const wins = (cur.calls > prev.calls ? 1 : 0) + (cur.clients > prev.clients ? 1 : 0) + (cur.quotes > prev.quotes ? 1 : 0);
    if (wins >= 2) {
        result.innerHTML = `<span style="color: var(--success)">🏆 You beat last week's version of you! 🔥</span>`;
    } else {
        result.innerHTML = `<span style="color: var(--text-secondary)">Keep pushing! You're neck and neck with last week's you. 💪</span>`;
    }
}

function renderReportCard() {
    const gradesContainer = $('#report-grades');
    const overallContainer = $('#report-overall');
    if (!gradesContainer || !overallContainer) return;

    const today = new Date();
    if (today.getDay() !== 0 && entries.length > 5) {
        // Show report card anyway if we have enough entries
    }

    const last7Days = entries.filter(e => e.type === 'evening' && new Date(e.timestamp) >= new Date(today - 7 * 24 * 60 * 60 * 1000));
    if (last7Days.length === 0) {
        gradesContainer.innerHTML = `<p style="text-align:center;color:var(--text-muted);">Fill more evening reviews to generate your report card</p>`;
        overallContainer.textContent = '';
        return;
    }

    let totalCalls = 0;
    let totalQuotes = 0;
    let avgMood = 0;
    const moodMap = { 'Normal': 1, 'Good': 2, 'Very Good': 3, 'Excellent': 4, 'Very Happy': 5 };

    last7Days.forEach(e => {
        totalCalls += parseInt(e.answers.total_calls) || 0;
        totalQuotes += parseInt(e.answers.quotations_sent) || 0;
        avgMood += moodMap[e.answers.day_mood] || 1;
    });

    avgMood = avgMood / last7Days.length;

    const getGrade = (val, target) => {
        const ratio = val / target;
        if (ratio >= 1.2) return 'A+';
        if (ratio >= 1.0) return 'A';
        if (ratio >= 0.8) return 'B';
        if (ratio >= 0.6) return 'C';
        return 'D';
    };

    const gCall = getGrade(totalCalls / last7Days.length, 15);
    const gQuote = getGrade(totalQuotes / last7Days.length, 3);
    const gMood = avgMood >= 4 ? 'A' : (avgMood >= 3 ? 'B' : 'C');

    gradesContainer.innerHTML = `
        <div class="rg-row"><span>Discipline (Consistency)</span><span class="rg-grade a">${last7Days.length >= 5 ? 'A+' : 'B'}</span></div>
        <div class="rg-row"><span>Productivity (Calls Made)</span><span class="rg-grade ${gCall.toLowerCase().substring(0,1)}">${gCall}</span></div>
        <div class="rg-row"><span>Client Work (Quotations)</span><span class="rg-grade ${gQuote.toLowerCase().substring(0,1)}">${gQuote}</span></div>
        <div class="rg-row"><span>Mindset (Avg Mood)</span><span class="rg-grade ${gMood.toLowerCase()}">${gMood}</span></div>
    `;

    overallContainer.innerHTML = `Overall Weekly Grade: <span style="color: var(--accent-primary)">A 🌟</span>`;
}

// ---- Achievements View ----
function refreshAchievementsScreen() {
    const curLevelObj = LEVELS[gameState.level - 1] || LEVELS[0];
    const nextLevelObj = LEVELS[gameState.level] || LEVELS[LEVELS.length - 1];

    const lvNum = $('#lv-num');
    if (lvNum) lvNum.textContent = `Level ${gameState.level}`;

    const lvTitle = $('#lv-title');
    if (lvTitle) lvTitle.textContent = curLevelObj.title;

    const curXPDisplay = $('#lv-xp-cur');
    const maxXPDisplay = $('#lv-xp-max');
    if (curXPDisplay) curXPDisplay.textContent = gameState.xp;
    if (maxXPDisplay) maxXPDisplay.textContent = nextLevelObj.xp;

    const lvBarFill = $('#lv-bar-fill');
    if (lvBarFill) {
        const curLevelXP = curLevelObj.xp;
        const nextLevelXP = nextLevelObj.xp;
        const xpProgress = gameState.xp - curLevelXP;
        const range = nextLevelXP - curLevelXP;
        const pct = range > 0 ? Math.min(100, Math.max(0, (xpProgress / range) * 100)) : 100;
        lvBarFill.style.width = `${pct}%`;
    }

    // Records
    $('#records-grid #rec-calls').textContent = gameState.recordCalls;
    $('#records-grid #rec-clients').textContent = gameState.recordClients;
    $('#records-grid #rec-quotes').textContent = gameState.recordQuotes;
    $('#records-grid #rec-streak').textContent = gameState.longestStreak;
    $('#records-grid #rec-power').textContent = gameState.recordPower;

    // Badges grid
    const grid = $('#badges-grid');
    if (grid) {
        grid.innerHTML = '';
        BADGES.forEach(badge => {
            const unlocked = gameState.badges.includes(badge.id);
            const item = document.createElement('div');
            item.className = `badge-item ${unlocked ? 'unlocked' : 'locked'}`;
            item.innerHTML = `
                <div class="bi-emoji">${badge.emoji}</div>
                <div class="bi-name">${badge.name}</div>
                <div class="bi-desc">${badge.desc}</div>
            `;
            grid.appendChild(item);
        });
    }
}

// ---- Journal / History View ----
let journalFilter = 'all';

function initJournalView() {
    $$('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            journalFilter = btn.dataset.f;
            refreshJournalScreen();
        });
    });

    const clearBtn = $('#btn-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            $('#modal-confirm').style.display = 'flex';
        });
    }

    $('#confirm-no').addEventListener('click', () => {
        $('#modal-confirm').style.display = 'none';
    });

    $('#confirm-yes').addEventListener('click', () => {
        localStorage.clear();
        gameState = {
            xp: 0, level: 1, streak: 0, longestStreak: 0, lastEntryDate: null, badges: [],
            totalEntries: 0, totalCalls: 0, totalClients: 0, totalQuotes: 0, totalFollowups: 0,
            recordCalls: 0, recordClients: 0, recordQuotes: 0, recordPower: 0,
            hadPerfectDay: false, hadPlanComplete: false, challengeAccepted: null, challengeCompleted: null
        };
        entries = [];
        saveAllData();
        $('#modal-confirm').style.display = 'none';
        switchScreen('home');
    });
}

function refreshJournalScreen() {
    const list = $('#journal-list');
    const empty = $('#journal-empty');
    if (!list) return;

    let filtered = [...entries].sort((a, b) => b.id - a.id);

    if (journalFilter !== 'all') {
        filtered = filtered.filter(e => e.type === journalFilter);
    }

    if (filtered.length === 0) {
        list.innerHTML = '';
        list.appendChild(empty);
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    list.innerHTML = '';

    filtered.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'j-entry';

        const date = new Date(entry.timestamp);
        const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        const icon = entry.type === 'morning' ? '🌅' : '🌆';
        const typeLabel = entry.type === 'morning' ? 'Morning Plan' : 'Evening Review';

        let bodyHTML = '';

        if (entry.type === 'morning') {
            bodyHTML = `
                <div class="j-detail"><span class="j-detail-label">🎯 Main Task</span><span class="j-detail-value">${escapeHTML(entry.answers.important_task || '')}</span></div>
                <div class="j-detail"><span class="j-detail-label">🏭 Markets</span><span class="j-detail-value">${escapeHTML(entry.answers.markets || '')}</span></div>
                <div class="j-detail"><span class="j-detail-label">⏰ Start Time</span><span class="j-detail-value">${escapeHTML(entry.answers.start_time || '')}</span></div>
            `;
            // Add custom rotating fields if present
            Object.keys(entry.answers).forEach(k => {
                if (!['important_task', 'markets', 'start_time'].includes(k)) {
                    bodyHTML += `<div class="j-detail"><span class="j-detail-label">${escapeHTML(k.replace(/_/g, ' '))}</span><span class="j-detail-value">${escapeHTML(entry.answers[k] || '')}</span></div>`;
                }
            });
        } else {
            const moodEmojis = { 'Normal': '😐', 'Good': '🙂', 'Very Good': '😊', 'Excellent': '😄', 'Very Happy': '🤩' };
            const moodEmoji = moodEmojis[entry.answers.day_mood] || '😐';

            bodyHTML = `
                <div class="j-detail"><span class="j-detail-label">⚡ Power Score</span><span class="j-detail-value"><strong>${entry.powerScore || '--'}</strong>/100</span></div>
                <div class="j-detail"><span class="j-detail-label">🎯 Plan Check</span><span class="j-detail-value">${escapeHTML(entry.answers.plan_check || '')}</span></div>
                <div class="j-detail"><span class="j-detail-label">😊 Mood</span><span class="j-detail-value"><span class="j-mood-pill">${moodEmoji} ${entry.answers.day_mood || ''}</span></span></div>
                <div class="j-detail"><span class="j-detail-label">📞 Calls</span><span class="j-detail-value">${entry.answers.total_calls || 0}</span></div>
                <div class="j-detail"><span class="j-detail-label">🤝 New Clients</span><span class="j-detail-value">${entry.answers.new_clients || 0}</span></div>
                <div class="j-detail"><span class="j-detail-label">📋 Quotes</span><span class="j-detail-value">${entry.answers.quotations_sent || 0}</span></div>
                <div class="j-detail"><span class="j-detail-label">✍️ Summary</span><span class="j-detail-value">${escapeHTML(entry.answers.day_description || '')}</span></div>
            `;

            Object.keys(entry.answers).forEach(k => {
                if (!['plan_check', 'day_mood', 'total_calls', 'new_clients', 'quotations_sent', 'day_description', 'tomorrow_task', 'followup_clients'].includes(k)) {
                    bodyHTML += `<div class="j-detail"><span class="j-detail-label">${escapeHTML(k.replace(/_/g, ' '))}</span><span class="j-detail-value">${escapeHTML(entry.answers[k] || '')}</span></div>`;
                }
            });
        }

        item.innerHTML = `
            <div class="j-entry-head">
                <div style="display:flex;align-items:center;gap:12px;">
                    <span class="j-entry-type">${icon}</span>
                    <div class="j-entry-info">
                        <h4>${typeLabel}</h4>
                        <span>${dayStr} at ${timeStr}</span>
                    </div>
                </div>
                <svg class="j-entry-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="j-entry-body">
                ${bodyHTML}
            </div>
        `;

        item.querySelector('.j-entry-head').onclick = () => {
            item.classList.toggle('open');
        };

        list.appendChild(item);
    });
}

// ---- Excel & CSV Export ----
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    script.onerror = () => {
        alert("Failed to load Excel library. Checking offline backup CSV...");
        exportToCSV();
    };
    document.head.appendChild(script);
}

function exportToExcel() {
    if (entries.length === 0) {
        alert("No entries to export yet!");
        return;
    }

    if (typeof XLSX === 'undefined') {
        const btn = $('#btn-export');
        const originalText = btn.textContent;
        btn.textContent = "Loading library... ⏳";
        btn.disabled = true;

        loadScript("https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js", () => {
            btn.textContent = originalText;
            btn.disabled = false;
            performExcelExport();
        });
    } else {
        performExcelExport();
    }
}

function performExcelExport() {
    try {
        // Raw Data Format
        const rawRows = entries.map(e => {
            const date = new Date(e.timestamp);
            return {
                Date: e.date,
                Time: date.toLocaleTimeString(),
                Type: e.type,
                PowerScore: e.powerScore || '',
                ...e.answers
            };
        });

        // Weekly Summary Format
        const weeklyData = [];
        // Group evening entries by week
        const eveningEntries = entries.filter(e => e.type === 'evening');
        const weeks = {};

        eveningEntries.forEach(e => {
            const date = new Date(e.timestamp);
            // Get week number
            const onejan = new Date(date.getFullYear(), 0, 1);
            const weekNum = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
            const key = `${date.getFullYear()}-W${weekNum}`;

            if (!weeks[key]) weeks[key] = { calls: 0, clients: 0, quotes: 0, count: 0, score: 0 };
            weeks[key].calls += parseInt(e.answers.total_calls) || 0;
            weeks[key].clients += parseInt(e.answers.new_clients) || 0;
            weeks[key].quotes += parseInt(e.answers.quotations_sent) || 0;
            weeks[key].score += e.powerScore || 0;
            weeks[key].count++;
        });

        Object.keys(weeks).forEach(k => {
            weeklyData.push({
                Week: k,
                TotalCalls: weeks[k].calls,
                TotalClients: weeks[k].clients,
                TotalQuotes: weeks[k].quotes,
                AvgPowerScore: Math.round(weeks[k].score / weeks[k].count)
            });
        });

        const wb = XLSX.utils.book_new();

        const wsRaw = XLSX.utils.json_to_sheet(rawRows);
        XLSX.utils.book_append_sheet(wb, wsRaw, "Raw Log");

        if (weeklyData.length > 0) {
            const wsWeekly = XLSX.utils.json_to_sheet(weeklyData);
            XLSX.utils.book_append_sheet(wb, wsWeekly, "Weekly Analytics");
        }

        XLSX.writeFile(wb, `DayPilot_Data_${getTodayKey()}.xlsx`);
    } catch (e) {
        alert("Excel export failed. Falling back to CSV.");
        exportToCSV();
    }
}

function exportToCSV() {
    if (entries.length === 0) {
        alert("No entries to export yet!");
        return;
    }

    const headers = ['ID', 'Date', 'Type', 'Timestamp', 'PowerScore', 'Answers JSON'];
    const rows = entries.map(e => [
        e.id,
        e.date,
        e.type,
        e.timestamp,
        e.powerScore || '',
        JSON.stringify(e.answers)
    ]);

    const csvContent = [headers, ...rows]
        .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DayPilot_Backup_${getTodayKey()}.csv`;
    link.click();
}

// ---- Confetti System ----
function launchConfetti() {
    const canvas = $('#confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#7c83ff', '#5865f2', '#ff9a56', '#a78bfa', '#34d399', '#f87171'];
    const particles = [];

    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0
        });
    }

    let active = true;
    function draw() {
        if (!active) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, idx) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle);
            p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });

        // check if all fall off screen
        const remaining = particles.filter(p => p.y < canvas.height);
        if (remaining.length === 0) {
            active = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            requestAnimationFrame(draw);
        }
    }
    draw();
    setTimeout(() => { active = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }, 4000);
}

// ---- Modals Helper ----
function showSessionCompleteModal(type, entry, xpEarned) {
    const modal = $('#modal-complete');
    if (!modal) return;

    const icon = type === 'morning' ? '🌅' : '🌆';
    const title = type === 'morning' ? 'Morning Plan Ready! 🚀' : 'Day Review Logged! 🎉';
    const msg = type === 'morning' ? "Your schedule is locked. Let's make today count!" : "Success score computed. Sleep well!";

    $('#mc-icon').textContent = icon;
    $('#mc-title').textContent = title;
    $('#mc-msg').textContent = msg;

    const xpLabel = $('#mc-xp');
    if (xpLabel) {
        xpLabel.style.display = 'block';
        xpLabel.textContent = `+${xpEarned} XP Earned!`;
    }

    const summary = $('#mc-summary');
    summary.innerHTML = '';

    const questions = type === 'morning' ? mQuestions : eQuestions;
    questions.forEach(q => {
        const val = entry.answers[q.key];
        if (val !== undefined) {
            const shortQ = q.q.replace(/[🎯📊⏰🏆😊📞🤝📋✍️📌]/g, '').substring(0, 25);
            summary.innerHTML += `
                <div class="ms-item">
                    <span class="ms-label">${shortQ}</span>
                    <span class="ms-value">${escapeHTML(String(val))}</span>
                </div>
            `;
        }
    });

    modal.style.display = 'flex';
    launchConfetti();

    $('#mc-close').onclick = () => {
        modal.style.display = 'none';
        switchScreen('home');
    };
}

function showBadgeUnlockModal(badge) {
    const modal = $('#modal-badge');
    if (!modal) return;

    $('#mb-name').textContent = badge.name;
    $('#mb-desc').textContent = badge.desc;
    modal.style.display = 'flex';

    launchConfetti();
    $('#mb-close').onclick = () => {
        modal.style.display = 'none';
    };
}

function showLevelUpModal(level) {
    const modal = $('#modal-level');
    if (!modal) return;

    const levelObj = LEVELS[level - 1] || LEVELS[0];
    $('#ml-level').textContent = `Level ${level}`;
    $('#ml-title').textContent = levelObj.title;
    modal.style.display = 'flex';

    launchConfetti();
    $('#ml-close').onclick = () => {
        modal.style.display = 'none';
    };
}

function showNewRecordModal() {
    const modal = $('#modal-record');
    if (!modal) return;

    modal.style.display = 'flex';
    launchConfetti();
    $('#mr-close').onclick = () => {
        modal.style.display = 'none';
    };
}

// ---- PWA Install Handling ----
let deferredPrompt;
function initPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Show install banner if not dismissed recently
        const dismissed = localStorage.getItem('dp_install_dismissed');
        const now = Date.now();
        if (!dismissed || (now - parseInt(dismissed) > 3 * 24 * 60 * 60 * 1000)) {
            const banner = $('#install-banner');
            if (banner) banner.style.display = 'block';
        }
    });

    const installBtn = $('#install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                const banner = $('#install-banner');
                if (banner) banner.style.display = 'none';
                deferredPrompt = null;
            });
        });
    }

    const dismissBtn = $('#install-dismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            const banner = $('#install-banner');
            if (banner) banner.style.display = 'none';
            localStorage.setItem('dp_install_dismissed', Date.now().toString());
        });
    }
}

// ---- Utilities ----
function getTodayKey() {
    return formatDateKey(new Date());
}

function formatDateKey(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
