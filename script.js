// Daily Win Journal App
class DailyWinJournal {
    constructor() {
        console.log('📝 Constructor called');
        this.wins = [];
        this.currentFilter = 'all';
        this.currentUser = null;
        this.isSignupMode = false;
        
        this.checkLoginState();
        this.setupEventListeners();
    }

    // Check if user is already logged in
    checkLoginState() {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            this.currentUser = savedEmail;
            this.showApp();
        }
    }

    // Set up all event listeners
    setupEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                console.log('Login clicked');
                this.handleLogin();
            });
        } else {
            console.error('loginBtn not found');
        }

        // Toggle signup/login mode
        const toggleSignup = document.getElementById('toggleSignup');
        if (toggleSignup) {
            toggleSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSignupMode();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Win form
        const winForm = document.getElementById('winForm');
        if (winForm) {
            winForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addWin();
            });
        }

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
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Clear button
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAll();
            });
        }

        // Email all wins
        const emailAllBtn = document.getElementById('emailAllBtn');
        if (emailAllBtn) {
            emailAllBtn.addEventListener('click', () => {
                this.emailAllWins();
            });
        }

        // Feedback
        this.setupFeedbackModal();
    }

    // Toggle between signup and login modes
    toggleSignupMode() {
        this.isSignupMode = !this.isSignupMode;
        const authTitle = document.getElementById('authTitle');
        const loginBtn = document.getElementById('loginBtn');
        const toggleBtn = document.getElementById('toggleSignup');
        const errorDiv = document.getElementById('authError');

        if (this.isSignupMode) {
            authTitle.textContent = 'Create Account';
            loginBtn.textContent = 'Sign Up';
            toggleBtn.textContent = 'Already have account? Sign In';
        } else {
            authTitle.textContent = 'Sign In';
            loginBtn.textContent = 'Sign In';
            toggleBtn.textContent = 'New user? Create Account';
        }
        errorDiv.textContent = '';
    }

    // Get all users from localStorage
    getAllUsers() {
        const usersJson = localStorage.getItem('__users__');
        return usersJson ? JSON.parse(usersJson) : {};
    }

    // Save users to localStorage
    saveAllUsers(users) {
        localStorage.setItem('__users__', JSON.stringify(users));
    }

    // Simple hash function for passwords
    hashPassword(password) {
        // This is a simple approach - not cryptographically secure
        // For production, use proper password hashing
        return btoa(password + 'salt'); // Base64 encoding
    }

    // Handle login/signup
    handleLogin() {
        const email = document.getElementById('userLoginEmail').value.trim();
        const password = document.getElementById('userLoginPassword').value.trim();
        const errorDiv = document.getElementById('authError');

        if (!email) {
            errorDiv.textContent = '❌ Please enter your email.';
            return;
        }

        if (!email.includes('@')) {
            errorDiv.textContent = '❌ Please enter a valid email.';
            return;
        }

        if (!password) {
            errorDiv.textContent = '❌ Please enter a password.';
            return;
        }

        if (password.length < 4) {
            errorDiv.textContent = '❌ Password must be at least 4 characters.';
            return;
        }

        const users = this.getAllUsers();
        const hashedPassword = this.hashPassword(password);

        if (this.isSignupMode) {
            // Signup mode - create new account
            if (users[email]) {
                errorDiv.textContent = '❌ This email already has an account. Try signing in.';
                return;
            }
            users[email] = hashedPassword;
            this.saveAllUsers(users);
            errorDiv.textContent = '✅ Account created! Signing in...';
            errorDiv.style.color = '#51cf66';
            setTimeout(() => {
                this.completeLogin(email, errorDiv);
            }, 1000);
        } else {
            // Login mode - verify credentials
            if (!users[email]) {
                errorDiv.textContent = '❌ Email not found. Create an account first.';
                return;
            }
            if (users[email] !== hashedPassword) {
                errorDiv.textContent = '❌ Incorrect password.';
                return;
            }
            this.completeLogin(email, errorDiv);
        }
    }

    // Complete the login process
    completeLogin(email, errorDiv) {
        this.currentUser = email;
        localStorage.setItem('userEmail', email);
        errorDiv.textContent = '';
        errorDiv.style.color = '';
        
        this.loadWins();
        this.showApp();
    }

    // Handle logout
    handleLogout() {
        if (confirm('Sign out?')) {
            this.currentUser = null;
            localStorage.removeItem('userEmail');
            this.wins = [];
            this.isSignupMode = false;
            
            document.getElementById('authScreen').classList.remove('hidden');
            document.getElementById('appScreen').classList.add('hidden');
            document.getElementById('userLoginEmail').value = '';
            document.getElementById('userLoginPassword').value = '';
            document.getElementById('authError').textContent = '';
            
            // Reset auth form to login mode
            const authTitle = document.getElementById('authTitle');
            const loginBtn = document.getElementById('loginBtn');
            const toggleBtn = document.getElementById('toggleSignup');
            authTitle.textContent = 'Sign In';
            loginBtn.textContent = 'Sign In';
            toggleBtn.textContent = 'New user? Create Account';
        }
    }

    // Show the app screen
    showApp() {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        document.getElementById('userEmail').textContent = `Signed in as: ${this.currentUser}`;
        
        this.loadWins();
        this.render();
        this.updateStats();
    }

    // Load wins from localStorage
    loadWins() {
        const key = `wins_${this.currentUser}`;
        const saved = localStorage.getItem(key);
        this.wins = saved ? JSON.parse(saved) : [];
    }

    // Save wins to localStorage
    saveWins() {
        const key = `wins_${this.currentUser}`;
        localStorage.setItem(key, JSON.stringify(this.wins));
    }

    // Add a new win
    addWin() {
        const title = document.getElementById('winTitle').value.trim();
        const description = document.getElementById('winDescription').value.trim();
        const category = document.getElementById('winCategory').value;

        if (!title) return;

        const win = {
            id: Date.now().toString(),
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
        this.saveWins();
        this.render();
        this.updateStats();

        document.getElementById('winForm').reset();
        alert('🎉 Win added! Keep going!');
    }

    // Delete a win
    deleteWin(id) {
        if (confirm('Delete this win?')) {
            this.wins = this.wins.filter(win => win.id !== id);
            this.saveWins();
            this.render();
            this.updateStats();
        }
    }

    // Render wins
    render() {
        const winsList = document.getElementById('winsList');
        const filtered = this.currentFilter === 'all'
            ? this.wins
            : this.wins.filter(win => win.category === this.currentFilter);

        if (filtered.length === 0) {
            winsList.innerHTML = '<p class="empty-state">No wins yet. Add your first win!</p>';
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
                    <button class="btn-small btn-delete" onclick="journal.deleteWin('${win.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Update stats
    updateStats() {
        const totalWins = this.wins.length;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weekWins = this.wins.filter(win => new Date(win.date) >= weekAgo).length;
        const streak = this.calculateStreak();

        document.getElementById('totalWins').textContent = totalWins;
        document.getElementById('weekWins').textContent = weekWins;
        document.getElementById('streakDays').textContent = streak;
    }

    // Calculate streak
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

    // Export data
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
        if (confirm('Delete ALL wins? This cannot be undone!')) {
            this.wins = [];
            this.saveWins();
            this.render();
            this.updateStats();
            alert('All wins deleted.');
        }
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Email all wins
    emailAllWins() {
        if (this.wins.length === 0) {
            alert('No wins to email. Add some wins first!');
            return;
        }

        const emailContent = this.formatWinsForEmail();
        const subject = `My Daily Wins Journal - ${new Date().toLocaleDateString()}`;
        const mailtoLink = `mailto:${this.currentUser}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;
        
        window.location.href = mailtoLink;
    }

    // Format wins for email
    formatWinsForEmail() {
        const header = `🏆 DAILY WIN JOURNAL - ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
        const divider = '='.repeat(60) + '\n\n';
        
        const winsText = this.wins.map((win, index) => {
            return `${index + 1}. [${win.category.toUpperCase()}] ${win.title}\n   Date: ${win.date}\n${win.description ? `   Details: ${win.description}\n` : ''}`;
        }).join('\n');

        const stats = `\n${divider}STATISTICS:\n- Total Wins: ${this.wins.length}\n- Streak Days: ${this.calculateStreak()}\n`;
        
        return header + divider + winsText + stats + `\n✨ Keep winning! 💪`;
    }

    // Setup feedback modal
    setupFeedbackModal() {
        const toggle = document.getElementById('feedbackToggle');
        const modal = document.getElementById('feedbackModal');
        const close = document.getElementById('feedbackClose');
        const form = document.getElementById('feedbackForm');

        if (!toggle || !modal || !close || !form) {
            console.error('Feedback modal elements missing');
            return;
        }

        toggle.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        close.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });
    }

    // Submit feedback
    submitFeedback() {
        const name = document.getElementById('feedbackName').value.trim();
        const email = document.getElementById('feedbackEmail').value.trim();
        const message = document.getElementById('feedbackMessage').value.trim();
        const note = document.getElementById('feedbackNote');

        if (!name || !email || !message) {
            note.textContent = 'Please fill all fields.';
            note.style.color = '#ff6b6b';
            return;
        }

        const formId = localStorage.getItem('formspreeId');
        
        if (!formId) {
            const id = prompt('Get ID from https://formspree.io/\nPaste Form ID (starts with f_):');
            if (id) {
                localStorage.setItem('formspreeId', id);
                this.submitFeedback();
            }
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);

        const btn = document.querySelector('.feedback-form button');
        btn.disabled = true;
        btn.textContent = 'Sending...';

        fetch(`https://formspree.io/f/${formId}`, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            if (response.ok) {
                note.textContent = '✅ Sent!';
                note.style.color = '#51cf66';
                document.getElementById('feedbackForm').reset();
                setTimeout(() => {
                    document.getElementById('feedbackModal').classList.add('hidden');
                    note.textContent = '';
                }, 2000);
            } else {
                throw new Error('Failed');
            }
        })
        .catch(error => {
            note.textContent = '❌ Error. Try again.';
            note.style.color = '#ff6b6b';
        })
        .finally(() => {
            btn.disabled = false;
            btn.textContent = 'Send Feedback';
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded fired - initializing Daily Win Journal');
    window.journal = new DailyWinJournal();
    console.log('✅ Journal initialized');
});
