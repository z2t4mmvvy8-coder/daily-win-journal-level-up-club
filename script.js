// Firebase setup - wait for Firebase to load
let db;

function initializeFirebase() {
    if (!window.firebase) {
        console.error('Firebase not loaded yet');
        setTimeout(initializeFirebase, 100);
        return;
    }
    
    // Initialize Firebase
    const app = firebase.initializeApp(window.firebaseConfig);
    db = firebase.firestore();
    
    // Initialize the journal app
    window.journal = new DailyWinJournal();
}

// Daily Win Journal App
class DailyWinJournal {
    constructor() {
        this.wins = [];
        this.currentFilter = 'all';
        this.currentUser = null;
        
        this.checkLoginState();
        this.initEventListeners();
    }

    // Check if user is logged in
    checkLoginState() {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            this.currentUser = savedEmail;
            this.signin();
        }
    }

    // Initialize event listeners
    initEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Form submission
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
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Clear button  
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }

        // Email all wins button
        const emailAllBtn = document.getElementById('emailAllBtn');
        if (emailAllBtn) {
            emailAllBtn.addEventListener('click', () => this.emailAllWins());
        }

        // Feedback modal
        this.setupFeedbackModal();
    }

    // Handle login
    async handleLogin() {
        const email = document.getElementById('userLoginEmail').value.trim();
        const errorDiv = document.getElementById('authError');

        if (!email) {
            errorDiv.textContent = 'Please enter your email.';
            return;
        }

        if (!email.includes('@')) {
            errorDiv.textContent = 'Please enter a valid email.';
            return;
        }

        errorDiv.textContent = '';
        this.currentUser = email;
        localStorage.setItem('userEmail', email);
        this.signin();
    }

    // Sign in UI update
    async signin() {
        // Hide auth screen, show app
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        
        // Update user email display
        document.getElementById('userEmail').textContent = `Signed in as: ${this.currentUser}`;
        
        // Load wins from Firestore
        await this.loadDataFromFirestore();
        this.render();
        this.updateStats();
    }

    // Handle logout
    handleLogout() {
        if (confirm('Are you sure you want to sign out?')) {
            this.currentUser = null;
            localStorage.removeItem('userEmail');
            this.wins = [];
            
            // Show auth screen, hide app
            document.getElementById('authScreen').classList.remove('hidden');
            document.getElementById('appScreen').classList.add('hidden');
            document.getElementById('userLoginEmail').value = '';
            document.getElementById('authError').textContent = '';
        }
    }

    // Load wins from Firestore
    async loadDataFromFirestore() {
        try {
            if (!db || !this.currentUser) return;
            
            const snapshot = await db.collection('users').doc(this.currentUser).collection('wins').get();
            this.wins = [];
            
            snapshot.forEach(doc => {
                this.wins.push({ id: doc.id, ...doc.data() });
            });
            
            // Sort by date (newest first)
            this.wins.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error loading wins:', error);
        }
    }

    // Save win to Firestore
    async saveWinToFirestore(win) {
        try {
            if (!db || !this.currentUser) return;
            
            const docRef = await db.collection('users').doc(this.currentUser).collection('wins').add(win);
            win.id = docRef.id;
            return win;
        } catch (error) {
            console.error('Error saving win:', error);
            alert('Error saving win. Please try again.');
        }
    }

    // Delete win from Firestore
    async deleteWinFromFirestore(id) {
        try {
            if (!db || !this.currentUser) return;
            
            await db.collection('users').doc(this.currentUser).collection('wins').doc(id).delete();
        } catch (error) {
            console.error('Error deleting win:', error);
        }
    }

    // Add a new win
    async addWin() {
        const title = document.getElementById('winTitle').value.trim();
        const description = document.getElementById('winDescription').value.trim();
        const category = document.getElementById('winCategory').value;

        if (!title) return;

        const win = {
            title,
            description,
            category,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        };

        await this.saveWinToFirestore(win);
        await this.loadDataFromFirestore();
        this.render();
        this.updateStats();

        // Reset form
        document.getElementById('winForm').reset();

        // Show success message
        alert('🎉 Win added! Keep going!');
    }

    // Delete a win
    async deleteWin(id) {
        if (confirm('Are you sure you want to delete this win?')) {
            await this.deleteWinFromFirestore(id);
            this.wins = this.wins.filter(win => win.id !== id);
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
                    <button class="btn-small btn-delete" onclick="journal.deleteWin('${win.id}')">Delete</button>
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
    async clearAll() {
        if (confirm('Are you sure? This will delete all your wins!')) {
            // Delete all wins from Firestore
            for (let win of this.wins) {
                await this.deleteWinFromFirestore(win.id);
            }
            
            this.wins = [];
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
        if (this.wins.length === 0) {
            alert('No wins to email. Add some wins first!');
            return;
        }

        // Format all wins into email content
        const emailContent = this.formatWinsForEmail();
        
        // Use mailto link to open default email client
        const subject = `My Daily Wins Journal - ${new Date().toLocaleDateString()}`;
        const body = emailContent;
        const mailtoLink = `mailto:${this.currentUser}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
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

    // Setup feedback modal
    setupFeedbackModal() {
        const feedbackToggle = document.getElementById('feedbackToggle');
        const feedbackModal = document.getElementById('feedbackModal');
        const feedbackClose = document.getElementById('feedbackClose');
        const feedbackForm = document.getElementById('feedbackForm');

        if (!feedbackToggle) return;

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

        // Use Formspree for feedback
        const formId = localStorage.getItem('formspreeId');
        
        if (!formId) {
            feedbackNote.textContent = 'Setup required: Please save your Formspree ID first.';
            feedbackNote.style.color = '#ff6b6b';
            const id = prompt('Get your Formspree ID from https://formspree.io/\nPaste your Form ID here (starts with "f_"):');
            if (id) {
                localStorage.setItem('formspreeId', id);
                this.submitFeedback();
            }
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
        fetch(`https://formspree.io/f/${formId}`, {
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
}

// Initialize the journal when Firebase is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for Firebase scripts to load
    setTimeout(() => {
        if (window.firebase && window.firebaseConfig) {
            initializeFirebase();
        } else {
            console.error('Firebase not available');
        }
    }, 500);
});
