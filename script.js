// Daily Win Journal - JavaScript Logic
class DailyWinJournal {
    constructor() {
        this.wins = [];
        this.currentFilter = 'all';
        this.loadData();
        this.initEventListeners();
        this.render();
        this.updateStats();
    }

    // Initialize event listeners
    initEventListeners() {
        // Form submission
        document.getElementById('winForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addWin();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
    }

    // Add a new win
    addWin() {
        const title = document.getElementById('winTitle').value.trim();
        const description = document.getElementById('winDescription').value.trim();
        const category = document.getElementById('winCategory').value;

        if (!title) return;

        const win = {
            id: Date.now(),
            title,
            description,
            category,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        };

        this.wins.unshift(win);
        this.saveData();
        this.render();
        this.updateStats();

        // Reset form
        document.getElementById('winForm').reset();

        // Show success message
        alert('🎉 Win added! Keep going!');
    }

    // Delete a win
    deleteWin(id) {
        if (confirm('Are you sure you want to delete this win?')) {
            this.wins = this.wins.filter(win => win.id !== id);
            this.saveData();
            this.render();
            this.updateStats();
        }
    }

    // Render wins to the DOM
    render() {
        const winsList = document.getElementById('winsList');
        const filtered = this.currentFilter === 'all'
            ? this.wins
            : this.wins.filter(win => win.category === this.currentFilter);

        if (filtered.length === 0) {
            winsList.innerHTML = '<p class="empty-state">No wins in this category yet. Add your first win!</p>';
            return;
        }

        winsList.innerHTML = filtered.map(win => `
            <div class="win-card" data-category="${win.category}">
                <div class="win-header">
                    <h3 class="win-title">${this.escapeHtml(win.title)}</h3>
                    <span class="win-category">${win.category.charAt(0).toUpperCase() + win.category.slice(1)}</span>
                </div>
                <p class="win-date">${win.date}</p>
                ${win.description ? `<p class="win-description">${this.escapeHtml(win.description)}</p>` : ''}
                <div class="win-actions">
                    <button class="btn-small btn-delete" onclick="journal.deleteWin(${win.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Update statistics
    updateStats() {
        const totalWins = this.wins.length;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weekWins = this.wins.filter(win => new Date(win.date) >= weekAgo).length;
        const streak = this.calculateStreak();

        document.getElementById('totalWins').textContent = totalWins;
        document.getElementById('weekWins').textContent = weekWins;
        document.getElementById('streakDays').textContent = streak;
    }

    // Calculate streak (consecutive days with wins)
    calculateStreak() {
        if (this.wins.length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let currentDate = new Date(today);

        const winsByDate = {};
        this.wins.forEach(win => {
            const dateStr = new Date(win.date).toDateString();
            winsByDate[dateStr] = true;
        });

        while (winsByDate[currentDate.toDateString()]) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        }

        return streak;
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('dailyWins', JSON.stringify(this.wins));
    }

    // Load data from localStorage
    loadData() {
        const saved = localStorage.getItem('dailyWins');
        this.wins = saved ? JSON.parse(saved) : [];
    }

    // Export data as JSON
    exportData() {
        const dataStr = JSON.stringify(this.wins, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `daily-wins-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Clear all data
    clearAll() {
        if (confirm('Are you sure? This will delete all your wins!')) {
            this.wins = [];
            this.saveData();
            this.render();
            this.updateStats();
            alert('All wins have been cleared.');
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the journal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.journal = new DailyWinJournal();
});
