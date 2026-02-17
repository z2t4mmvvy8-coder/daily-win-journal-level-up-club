// Daily Win Journal - JavaScript Logic
class DailyWinJournal {
    constructor() {
        this.wins = [];
        this.currentFilter = 'all';
        this.loadData();
        this.loadEmailConfig();
        this.initEventListeners();
        this.render();
        this.updateStats();
    }

    // Initialize EmailJS (free service for sending emails)
    loadEmailConfig() {
        // Initialize EmailJS with public key
        // Note: Users need to set up their own EmailJS account
        const emailPublicKey = localStorage.getItem('emailPublicKey');
        if (emailPublicKey) {
            emailjs.init(emailPublicKey);
        }
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

        // Email all wins button
        document.getElementById('emailAllBtn').addEventListener('click', () => this.emailAllWins());

        // Load saved email from localStorage
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            document.getElementById('userEmail').value = savedEmail;
        }

        // Save email to localStorage when user updates it
        document.getElementById('userEmail').addEventListener('change', (e) => {
            localStorage.setItem('userEmail', e.target.value);
        });

        // Feedback modal
        this.setupFeedbackModal();
    }

    // Setup feedback modal
    setupFeedbackModal() {
        const feedbackToggle = document.getElementById('feedbackToggle');
        const feedbackModal = document.getElementById('feedbackModal');
        const feedbackClose = document.getElementById('feedbackClose');
        const feedbackForm = document.getElementById('feedbackForm');

        // Open modal
        feedbackToggle.addEventListener('click', () => {
            feedbackModal.classList.remove('hidden');
        });

        // Close modal
        feedbackClose.addEventListener('click', () => {
            feedbackModal.classList.add('hidden');
        });

        // Close modal when clicking outside
        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) {
                feedbackModal.classList.add('hidden');
            }
        });

        // Handle form submission
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });
    }

    // Submit feedback
    submitFeedback() {
        const name = document.getElementById('feedbackName').value.trim();
        const email = document.getElementById('feedbackEmail').value.trim();
        const message = document.getElementById('feedbackMessage').value.trim();
        const feedbackNote = document.getElementById('feedbackNote');

        if (!name || !email || !message) {
            feedbackNote.textContent = 'Please fill in all fields.';
            feedbackNote.style.color = '#ff6b6b';
            return;
        }

        // Create FormData for Formspree
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);

        const submitBtn = document.querySelector('.feedback-form button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Send to Formspree
        fetch('https://formspree.io/f/meealkdb', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                feedbackNote.textContent = '✅ Feedback sent! Thank you!';
                feedbackNote.style.color = '#51cf66';
                document.getElementById('feedbackForm').reset();
                setTimeout(() => {
                    document.getElementById('feedbackModal').classList.add('hidden');
                    feedbackNote.textContent = '';
                }, 2000);
            } else {
                throw new Error('Failed to send');
            }
        })
        .catch(error => {
            feedbackNote.textContent = '❌ Error sending feedback. Please try again.';
            feedbackNote.style.color = '#ff6b6b';
            console.error('Feedback error:', error);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Feedback';
        });
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

    // Email all wins
    emailAllWins() {
        const userEmail = document.getElementById('userEmail').value.trim();
        
        if (!userEmail) {
            alert('Please enter your email address first.');
            return;
        }

        if (this.wins.length === 0) {
            alert('No wins to email. Add some wins first!');
            return;
        }

        // Format all wins into email content
        const emailContent = this.formatWinsForEmail();
        
        // Simple approach: Use mailto link to open default email client
        const subject = `My Daily Wins Journal - ${new Date().toLocaleDateString()}`;
        const body = emailContent;
        const mailtoLink = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoLink;
        alert('Opening your email client. If it didn\'t open, copy-paste the content manually.');
    }

    // Format wins for email display
    formatWinsForEmail() {
        const header = `🏆 DAILY WIN JOURNAL - ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
        const divider = '='.repeat(60) + '\n\n';
        
        const winsText = this.wins.map((win, index) => {
            return `${index + 1}. [${win.category.toUpperCase()}] ${win.title}\n   Date: ${win.date}\n${win.description ? `   Details: ${win.description}\n` : ''}`;
        }).join('\n');

        const stats = `\n${divider}STATISTICS:\n- Total Wins: ${this.wins.length}\n- Streak Days: ${this.calculateStreak()}\n`;
        
        return header + divider + winsText + stats + `\n✨ Keep winning! 💪\n\nJournal URL: ${window.location.href}`;
    }
}

// Initialize the journal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.journal = new DailyWinJournal();
});
