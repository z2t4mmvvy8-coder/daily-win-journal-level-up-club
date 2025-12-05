# Daily Win Journal - Level Up Club

A beautiful, interactive web application to track your daily wins and achievements. Perfect for personal development and maintaining motivation as part of the Level Up Club community.

## Features

✅ **Daily Win Tracking** - Log your accomplishments each day
✅ **Categorization** - Organize wins by Work, Health, Learning, Personal, Social, and Other
✅ **Statistics** - View total wins, weekly wins, and your current streak
✅ **Filter & Search** - Filter wins by category to focus on specific areas
✅ **Local Storage** - Your data is saved automatically in your browser
✅ **Export Data** - Download your wins as a JSON file for backup
✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
✅ **GitHub Pages Ready** - Deploy directly to GitHub Pages

## Getting Started

### Option 1: Use Online (GitHub Pages)
Simply open `index.html` in your browser or deploy this repository to GitHub Pages.

### Option 2: Run Locally
1. Clone the repository:
```bash
git clone https://github.com/z2t4mmvvy8-coder/daily-win-journal-level-up-club.git
cd daily-win-journal-level-up-club
```

2. Open in your browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or use a local server (Python example):
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

## How to Use

1. **Add a Win**: Fill in the win title, optional description, and select a category
2. **Click "Add Win"**: Your win is immediately saved to your browser
3. **View Your Wins**: See all your wins displayed with dates and categories
4. **Filter**: Click category buttons to filter wins by type
5. **Track Progress**: Check your stats—total wins, weekly wins, and consecutive-day streak
6. **Export Data**: Click "Export Data" to download your wins as JSON
7. **Clear All**: Reset everything if you want to start fresh

## Deployment on GitHub Pages

1. Go to your repository settings
2. Scroll to "GitHub Pages" section
3. Select `main` branch as the source
4. Your site will be live at: `https://username.github.io/daily-win-journal-level-up-club`

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - No dependencies, pure JavaScript
- **LocalStorage API** - Client-side data persistence

## File Structure

```
.
├── index.html      # Main HTML file
├── styles.css      # Styling and responsive design
├── script.js       # JavaScript logic and interactivity
└── README.md       # This file
```

## Features Explained

### Statistics Dashboard
- **Total Wins**: Cumulative count of all wins recorded
- **This Week**: Number of wins added in the last 7 days
- **Streak Days**: Consecutive days with at least one win

### Categories
- **Work**: Professional achievements
- **Health**: Fitness, nutrition, wellness
- **Learning**: Skills, courses, knowledge gained
- **Personal**: Life milestones, habits, growth
- **Social**: Relationships, community involvement
- **Other**: Miscellaneous wins

### Data Persistence
All your wins are automatically saved to your browser's localStorage. Your data persists even after closing the browser, but is local to your device.

## Tips for Success

🎯 **Set daily goals** - Challenge yourself to record at least one win per day
📊 **Review weekly** - Look back at your wins to see your progress
🎉 **Celebrate small wins** - Every achievement counts, no matter how small
🤝 **Share your wins** - Export and share your progress with friends or accountability partners
📈 **Track patterns** - Notice which categories you excel in and where you need growth

## Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

Have ideas for improvements? Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - Feel free to use this for personal or commercial projects.

## Support

If you find this helpful, please:
- ⭐ Star this repository
- 📢 Share it with your Level Up Club community
- 💬 Leave feedback or suggestions

---

**Made with ❤️ for the Level Up Club Community**

Keep tracking those wins and keep leveling up! 🚀
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Win Journal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
            50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }
        }
        .float-animation {
            animation: float 3s ease-in-out infinite;
        }
        .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
        }
        .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
        }
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            min-height: 100vh;
        }
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .glass {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .glass-strong {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .category-badge {
            transition: all 0.3s ease;
        }
        .category-badge:hover {
            transform: scale(1.1);
        }
        .win-card {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .win-card:hover {
            transform: translateY(-5px);
        }
        .win-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
        }
        .win-card:hover::before {
            left: 100%;
        }
        .stat-card {
            transition: all 0.3s ease;
        }
        .stat-card:hover {
            transform: scale(1.05);
        }
        .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            background: #f0f;
            position: absolute;
            animation: confetti-fall 3s linear forwards;
        }
        @keyframes confetti-fall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    </style>
</head>
<body>
    <div class="max-w-5xl mx-auto p-6">
        <!-- Floating Particles Background -->
        <div class="fixed inset-0 pointer-events-none overflow-hidden">
            <div class="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full opacity-20 blur-3xl float-animation"></div>
            <div class="absolute top-40 right-20 w-40 h-40 bg-pink-300 rounded-full opacity-20 blur-3xl float-animation" style="animation-delay: 1s;"></div>
            <div class="absolute bottom-20 left-1/3 w-36 h-36 bg-blue-300 rounded-full opacity-20 blur-3xl float-animation" style="animation-delay: 2s;"></div>
        </div>

        <!-- Header -->
        <div class="text-center mb-10 relative z-10 fade-in-up">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full mb-6 pulse-glow shadow-2xl">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
            </div>
            <h1 class="text-6xl font-black text-white mb-3 drop-shadow-2xl">
                Daily Win Journal
            </h1>
            <p class="text-xl text-white font-semibold drop-shadow-lg">✨ Celebrate your progress, one win at a time ✨</p>
            
            <!-- Stats Bar -->
            <div class="mt-8 flex justify-center gap-6">
                <div class="glass px-6 py-3 rounded-full">
                    <span class="text-white font-bold text-lg" id="totalWinsHeader">0 Total Wins</span>
                </div>
                <div class="glass px-6 py-3 rounded-full">
                    <span class="text-white font-bold text-lg" id="streakHeader">🔥 0 Day Streak</span>
                </div>
            </div>
        </div>

        <!-- Navigation -->
        <div class="flex gap-4 mb-8 relative z-10 fade-in-up" style="animation-delay: 0.2s;">
            <button onclick="switchView('journal')" id="journalBtn" class="flex-1 py-4 px-8 rounded-2xl font-bold transition-all text-lg glass-strong text-purple-600 shadow-2xl transform hover:scale-105">
                <svg class="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                Journal
            </button>
            <button onclick="switchView('insights')" id="insightsBtn" class="flex-1 py-4 px-8 rounded-2xl font-bold transition-all text-lg glass text-white hover:glass-strong hover:text-purple-600 transform hover:scale-105">
                <svg class="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Weekly Insights
            </button>
        </div>

        <!-- Journal View -->
        <div id="journalView" class="relative z-10">
            <!-- Add Entry Button -->
            <button onclick="showAddForm()" id="addBtn" class="w-full py-6 px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all mb-8 text-xl transform hover:scale-105 pulse-glow fade-in-up" style="animation-delay: 0.3s;">
                <svg class="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Today's Win 🎯
            </button>

            <!-- Add Entry Form -->
            <div id="addForm" class="glass-strong rounded-2xl shadow-2xl p-8 mb-8 fade-in-up" style="display: none;">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Record Your Win</h3>
                    <button onclick="hideAddForm()" class="text-gray-400 hover:text-gray-600 transform hover:scale-110 transition-all">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <label class="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select id="categorySelect" class="w-full p-4 border-2 border-purple-300 rounded-xl mb-6 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all text-lg font-semibold">
                    <option>🏃 Health & Fitness</option>
                    <option>💼 Career & Work</option>
                    <option>❤️ Relationships</option>
                    <option>🌱 Personal Growth</option>
                    <option>🎨 Creativity</option>
                    <option>💰 Finance</option>
                    <option>📚 Learning</option>
                    <option>✨ Other</option>
                </select>

                <label class="block text-sm font-bold text-gray-700 mb-2">Your Win</label>
                <textarea id="winText" placeholder="What did you accomplish today? Be specific and celebrate yourself! 🎉" class="w-full p-4 border-2 border-purple-300 rounded-xl mb-6 h-40 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all text-lg"></textarea>

                <button onclick="addEntry()" class="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all text-xl transform hover:scale-105">
                    🎉 Save Win
                </button>
            </div>

            <!-- Entries List -->
            <div id="entriesList" class="space-y-4"></div>
        </div>

        <!-- Insights View -->
        <div id="insightsView" style="display: none;" class="relative z-10">
            <div class="glass-strong rounded-2xl shadow-2xl p-8 fade-in-up">
                <h3 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8">Your Week in Review</h3>
                <div id="insightsContent"></div>
            </div>
        </div>
    </div>

    <script>
        const CATEGORIES = [
            '🏃 Health & Fitness',
            '💼 Career & Work',
            '❤️ Relationships',
            '🌱 Personal Growth',
            '🎨 Creativity',
            '💰 Finance',
            '📚 Learning',
            '✨ Other'
        ];

        const IMPROVEMENTS = {
            '🏃 Health & Fitness': 'Try adding 10 more minutes to your routine or explore a new form of exercise like yoga, swimming, or rock climbing!',
            '💼 Career & Work': 'Set a specific professional goal for next week, learn a new skill relevant to your field, or mentor a colleague.',
            '❤️ Relationships': 'Schedule quality time with someone important, reach out to reconnect with an old friend, or express gratitude to someone who matters.',
            '🌱 Personal Growth': 'Pick up a new habit using the 2-minute rule, dedicate time to reflection and journaling, or read about a topic that fascinates you.',
            '🎨 Creativity': 'Start a new creative project, experiment with a different medium, or collaborate with another creative person.',
            '💰 Finance': 'Review your budget, research a new investment or savings strategy, or learn about passive income opportunities.',
            '📚 Learning': 'Dive deeper into a subject you\'re curious about, teach someone what you\'ve learned, or take an online course.',
            '✨ Other': 'Reflect on what made this area important and how you can build on it. Set a specific goal for next week!'
        };

        let entries = [];
        let currentView = 'journal';

        // Storage functions using localStorage
        function saveToStorage() {
            try {
                localStorage.setItem('dailyWinEntries', JSON.stringify(entries));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
            }
        }

        function loadFromStorage() {
            try {
                const stored = localStorage.getItem('dailyWinEntries');
                if (stored) {
                    entries = JSON.parse(stored);
                    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
                entries = [];
            }
        }

        function createConfetti() {
            const colors = ['#f0f', '#0ff', '#ff0', '#0f0', '#f00', '#00f'];
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.left = Math.random() * 100 + '%';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.animationDelay = Math.random() * 0.3 + 's';
                    document.body.appendChild(confetti);
                    setTimeout(() => confetti.remove(), 3000);
                }, i * 30);
            }
        }

        function loadEntries() {
            loadFromStorage();
            renderEntries();
            updateHeaderStats();
        }

        function updateHeaderStats() {
            document.getElementById('totalWinsHeader').textContent = `${entries.length} Total Wins`;
            const streak = calculateStreak();
            document.getElementById('streakHeader').textContent = `🔥 ${streak} Day Streak`;
        }

        function calculateStreak() {
            if (entries.length === 0) return 0;
            
            let streak = 0;
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            
            for (let i = 0; i < entries.length; i++) {
                const entryDate = new Date(entries[i].date);
                entryDate.setHours(0, 0, 0, 0);
                
                const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === streak) {
                    streak++;
                } else if (daysDiff > streak) {
                    break;
                }
            }
            
            return streak;
        }

        function showAddForm() {
            document.getElementById('addForm').style.display = 'block';
            document.getElementById('addBtn').style.display = 'none';
        }

        function hideAddForm() {
            document.getElementById('addForm').style.display = 'none';
            document.getElementById('addBtn').style.display = 'block';
            document.getElementById('winText').value = '';
        }

        function addEntry() {
            const winText = document.getElementById('winText').value.trim();
            const category = document.getElementById('categorySelect').value;

            if (!winText) return;

            const entry = {
                id: Date.now().toString(),
                win: winText,
                category: category,
                date: new Date().toISOString()
            };

            entries.unshift(entry);
            saveToStorage();
            renderEntries();
            updateHeaderStats();
            hideAddForm();
            createConfetti();
        }

        function deleteEntry(id) {
            if (!confirm('Are you sure you want to delete this win?')) return;
            
            entries = entries.filter(e => e.id !== id);
            saveToStorage();
            renderEntries();
            updateHeaderStats();
            if (currentView === 'insights') {
                renderInsights();
            }
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                return 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Yesterday';
            } else {
                return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            }
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function renderEntries() {
            const container = document.getElementById('entriesList');
            
            if (entries.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-16 glass-strong rounded-2xl shadow-xl fade-in-up">
                        <svg class="w-24 h-24 text-purple-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                        </svg>
                        <p class="text-gray-600 text-2xl font-bold">No wins yet! Start recording your achievements. 🌟</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = entries.map((entry, index) => `
                <div class="win-card glass-strong rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all fade-in-up" style="animation-delay: ${index * 0.1}s;">
                    <div class="flex justify-between items-start mb-3">
                        <span class="category-badge text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full shadow-lg">
                            ${escapeHtml(entry.category)}
                        </span>
                        <div class="flex items-center gap-3">
                            <span class="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">${formatDate(entry.date)}</span>
                            <button onclick="deleteEntry('${entry.id}')" class="text-gray-400 hover:text-red-500 transition-colors transform hover:scale-125">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <p class="text-gray-800 leading-relaxed text-lg font-medium">${escapeHtml(entry.win)}</p>
                </div>
            `).join('');
        }

        function getWeeklyAnalysis() {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const weekEntries = entries.filter(e => 
                new Date(e.date) >= oneWeekAgo
            );

            const categoryCount = {};
            weekEntries.forEach(entry => {
                categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
            });

            const sorted = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
            const topCategory = sorted[0];

            return {
                totalWins: weekEntries.length,
                topCategory: topCategory ? topCategory[0] : null,
                topCount: topCategory ? topCategory[1] : 0,
                categoryBreakdown: sorted,
                suggestion: topCategory ? IMPROVEMENTS[topCategory[0]] : 'Keep logging your wins!'
            };
        }

        function renderInsights() {
            const analysis = getWeeklyAnalysis();
            const container = document.getElementById('insightsContent');

            if (analysis.totalWins === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <svg class="w-24 h-24 text-purple-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <p class="text-gray-600 text-2xl font-bold">Start logging wins to see your insights! 📊</p>
                    </div>
                `;
                return;
            }

            const breakdownHTML = analysis.categoryBreakdown.map(([category, count]) => `
                <div class="mb-4">
                    <div class="flex justify-between mb-2">
                        <span class="text-lg font-bold text-gray-800">${escapeHtml(category)}</span>
                        <span class="text-lg font-bold text-purple-600">${count} wins</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                        <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-4 rounded-full transition-all duration-1000 shadow-lg" style="width: ${(count / analysis.totalWins) * 100}%"></div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = `
                <div class="grid grid-cols-2 gap-6 mb-8">
                    <div class="stat-card bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-center shadow-2xl transform hover:scale-105 transition-all">
                        <div class="text-6xl font-black text-white mb-3">${analysis.totalWins}</div>
                        <div class="text-white text-xl font-bold">Total Wins 🎯</div>
                    </div>
                    
                    <div class="stat-card bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-8 text-center shadow-2xl transform hover:scale-105 transition-all">
                        <div class="text-6xl font-black text-white mb-3">${analysis.topCount}</div>
                        <div class="text-white text-xl font-bold">Top Category 🏆</div>
                    </div>
                </div>

                <div class="mb-8">
                    <h4 class="text-2xl font-black text-gray-800 mb-4">🌟 Most Improved Area</h4>
                    <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-2xl p-8 shadow-2xl pulse-glow">
                        <div class="text-4xl font-black mb-2">${escapeHtml(analysis.topCategory)}</div>
                        <div class="text-purple-100 text-xl font-semibold">${analysis.topCount} wins this week</div>
                    </div>
                </div>

                <div class="mb-8">
                    <h4 class="text-2xl font-black text-gray-800 mb-4">📊 Category Breakdown</h4>
                    <div class="bg-white rounded-2xl p-6 shadow-xl">
                        ${breakdownHTML}
                    </div>
                </div>

                <div class="bg-gradient-to-r from-blue-500 to-cyan-500 border-l-8 border-blue-700 text-white p-6 rounded-2xl shadow-2xl">
                    <div class="flex items-start gap-4">
                        <svg class="w-10 h-10 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        <div>
                            <h4 class="font-black text-2xl mb-2">💡 Suggestion for Next Week</h4>
                            <p class="text-lg font-semibold leading-relaxed">${escapeHtml(analysis.suggestion)}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        function switchView(view) {
            currentView = view;
            
            if (view === 'journal') {
                document.getElementById('journalView').style.display = 'block';
                document.getElementById('insightsView').style.display = 'none';
                document.getElementById('journalBtn').className = 'flex-1 py-4 px-8 rounded-2xl font-bold transition-all text-lg glass-strong text-purple-600 shadow-2xl transform hover:scale-105';
                document.getElementById('insightsBtn').className = 'flex-1 py-4 px-8 rounded-2xl font-bold transition-all text-lg glass text-white hover:glass-strong hover:text-purple-600 transform hover:scale-105';
            } else {
                document.getElementById('journalView').style.display = 'none';
                document.getElementById('insightsView').style.display = 'block';
                document.getElementById('journalBtn').className = 'flex-1 py-4 px-8 rounded-2xl font-bold transition-all text-lg glass text-white hover:glass-strong hover:text-purple-600 transform hover:scale-105';
                document.getElementById('insightsBtn').className = 'flex-1 py-4 px-8 rounded-2xl font-bold transition-all text-lg glass-strong text-purple-600 shadow-2xl transform hover:scale-105';
                renderInsights();
            }
        }

        // Initialize
        loadEntries();
    </script>
</body>
</html>