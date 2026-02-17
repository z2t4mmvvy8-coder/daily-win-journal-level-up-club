// Import Firebase Firestore functions
import { 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    updateDoc,
    deleteDoc,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

// Daily Win Journal App with Cloud Sync
class DailyWinJournal {
    constructor() {
        console.log('📝 Constructor called');
        this.wins = [];
        this.currentFilter = 'all';
        this.currentUser = null;
        this.isSignupMode = false;
        this.db = window.db;
        this.unsubscribe = null;
        
        if (!this.db) {
            console.error('❌ Firebase not available');
            const errorDiv = document.getElementById('authError');
            if (errorDiv) {
                errorDiv.textContent = '❌ Firebase connection failed. Check your internet.';
                errorDiv.style.display = 'block';
            }
            return;
        }
        
        this.checkLoginState();
        this.setupEventListeners();
    }

    // Check if user is already logged in
    async checkLoginState() {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            this.currentUser = savedEmail;
            await this.loadWinsFromCloud();
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

    // Simple hash function for passwords
    hashPassword(password) {
        return btoa(password + 'salt'); // Base64 encoding (for demo)
    }

    // Handle login/signup with Firebase
    async handleLogin() {
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

        const hashedPassword = this.hashPassword(password);

        try {
            if (!this.db) {
                throw new Error('Database not connected');
            }

            const userRef = doc(this.db, 'users', email);
            let userSnap;
            
            try {
                userSnap = await getDoc(userRef);
            } catch (error) {
                console.error('Firebase error:', error);
                if (error.code === 'permission-denied') {
                    errorDiv.textContent = '❌ Permission denied. Check Firebase setup.';
                } else if (error.code === 'unavailable') {
                    errorDiv.textContent = '❌ Firebase service unavailable. Try again later.';
                } else {
                    errorDiv.textContent = '❌ Connection error. Check your internet.';
                }
                return;
            }

            if (this.isSignupMode) {
                // Signup mode
                if (userSnap.exists()) {
                    errorDiv.textContent = '❌ This email already has an account. Try signing in.';
                    return;
                }
                
                // Create new user in Firestore
                try {
                    await setDoc(userRef, {
                        email: email,
                        password: hashedPassword,
                        createdAt: new Date().toISOString(),
                        wins: []
                    });
                } catch (error) {
                    console.error('Error creating account:', error);
                    errorDiv.textContent = '❌ Error creating account. Try again.';
                    return;
                }
                
                errorDiv.textContent = '✅ Account created! Signing in...';
                errorDiv.style.color = '#51cf66';
                
                setTimeout(() => {
                    this.completeLogin(email, errorDiv);
                }, 1000);
            } else {
                // Login mode
                if (!userSnap.exists()) {
                    errorDiv.textContent = '❌ Email not found. Create an account first.';
                    return;
                }

                if (userSnap.data().password !== hashedPassword) {
                    errorDiv.textContent = '❌ Incorrect password.';
                    return;
                }

                this.completeLogin(email, errorDiv);
            }
        } catch (error) {
            console.error('Auth error:', error);
            errorDiv.textContent = '❌ Error: ' + (error.message || 'Unknown error');
        }
    }

    // Complete the login process
    async completeLogin(email, errorDiv) {
        this.currentUser = email;
        localStorage.setItem('userEmail', email);
        errorDiv.textContent = '';
        errorDiv.style.color = '';
        
        await this.loadWinsFromCloud();
        this.showApp();
    }

    // Load wins from Firestore (real-time sync)
    async loadWinsFromCloud() {
        try {
            const userRef = doc(this.db, 'users', this.currentUser);
            
            // Unsubscribe from previous listener if exists
            if (this.unsubscribe) {
                this.unsubscribe();
            }

            // Set up real-time listener
            this.unsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    this.wins = doc.data().wins || [];
                    this.render();
                    this.updateStats();
                }
            }, (error) => {
                console.error('Error loading wins:', error);
                // Fallback to localStorage
                this.loadWinsLocal();
            });

        } catch (error) {
            console.error('Cloud load error:', error);
            this.loadWinsLocal();
        }
    }

    // Fallback: Load wins from localStorage
    loadWinsLocal() {
        const saved = localStorage.getItem(`wins_${this.currentUser}`);
        this.wins = saved ? JSON.parse(saved) : [];
    }

    // Save wins to Firestore and localStorage
    async saveWins() {
        try {
            const userRef = doc(this.db, 'users', this.currentUser);
            await updateDoc(userRef, {
                wins: this.wins,
                updatedAt: new Date().toISOString()
            });
            console.log('✅ Wins synced to cloud');
        } catch (error) {
            console.error('Error saving wins:', error);
        }

        // Also save locally for offline support
        localStorage.setItem(`wins_${this.currentUser}`, JSON.stringify(this.wins));
    }

    // Add a new win
    addWin() {
        const title = document.getElementById('winTitle').value.trim();
        const description = document.getElementById('winDescription').value.trim();
        const category = document.getElementById('winCategory').value;

        if (!title) {
            alert('Please enter a win title.');
            return;
        }

        const win = {
            id: Date.now().toString(),
            title: this.escapeHtml(title),
            description: this.escapeHtml(description),
            category: category,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.wins.unshift(win);
        this.saveWins();

        // Clear form
        document.getElementById('winForm').reset();
        this.render();
        this.updateStats();
    }

    // Delete a win
    deleteWin(id) {
        if (confirm('Delete this win?')) {
            this.wins = this.wins.filter(w => w.id !== id);
            this.saveWins();
            this.render();
            this.updateStats();
        }
    }

    // Render wins to the page
    render() {
        const winsList = document.getElementById('winsList');

        if (this.wins.length === 0) {
            winsList.innerHTML = '<p class="empty-state">No wins yet. Add your first win above!</p>';
            return;
        }

        const filtered = this.wins.filter(w => 
            this.currentFilter === 'all' || w.category === this.currentFilter
        );

        if (filtered.length === 0) {
            winsList.innerHTML = '<p class="empty-state">No wins in this category yet.</p>';
            return;
        }

        winsList.innerHTML = filtered.map(win => `
            <div class="win-card ${win.category}">
                <div class="win-header">
                    <h3>${win.title}</h3>
                    <span class="win-category">${win.category}</span>
                </div>
                <p class="win-description">${win.description}</p>
                <div class="win-footer">
                    <span class="win-date">${new Date(win.date).toLocaleDateString()}</span>
                    <button class="win-delete" onclick="window.journal.deleteWin('${win.id}')">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Update statistics
    updateStats() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalWins = this.wins.length;
        const weekWins = this.wins.filter(w => new Date(w.date) >= weekAgo).length;
        const streakDays = this.calculateStreak();

        document.getElementById('totalWins').textContent = totalWins;
        document.getElementById('weekWins').textContent = weekWins;
        document.getElementById('streakDays').textContent = streakDays;
    }

    // Calculate win streak
    calculateStreak() {
        if (this.wins.length === 0) return 0;

        const dates = this.wins.map(w => new Date(w.date).toDateString());
        const uniqueDates = [...new Set(dates)];

        let streak = 0;
        const today = new Date();
        let currentDate = new Date(today);

        for (const date of uniqueDates.sort(() => -1)) {
            const winDate = new Date(date);
            const diff = Math.floor((currentDate - winDate) / (1000 * 60 * 60 * 24));

            if (diff === 0 || diff === 1) {
                streak++;
                currentDate = winDate;
            } else {
                break;
            }
        }

        return streak;
    }

    // Export data
    exportData() {
        const data = {
            user: this.currentUser,
            exportedAt: new Date().toISOString(),
            wins: this.wins
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wins-${this.currentUser}-${new Date().toISOString().split('T')[0]}.json`;
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
            alert('No wins to email!');
            return;
        }

        const emailBody = this.formatWinsForEmail();
        const subject = `My Daily Wins - ${new Date().toLocaleDateString()}`;
        const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailto;
    }

    // Format wins for email
    formatWinsForEmail() {
        let text = `🏆 Daily Win Journal - ${this.currentUser}\n`;
        text += `Generated: ${new Date().toLocaleString()}\n\n`;

        this.wins.forEach((win, idx) => {
            text += `${idx + 1}. [${win.category.toUpperCase()}] ${win.title}\n`;
            if (win.description) text += `   ${win.description}\n`;
            text += `   Date: ${new Date(win.date).toLocaleDateString()}\n\n`;
        });

        text += `Total Wins: ${this.wins.length}\n`;
        text += `\n🚀 Keep winning! Track more at: https://z2t4mmvvy8-coder.github.io/daily-win-journal-level-up-club/`;
        
        return text;
    }

    // Show the app screen
    showApp() {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        document.getElementById('userEmail').textContent = `Signed in as: ${this.currentUser}`;
        this.render();
        this.updateStats();
    }

    // Handle logout
    handleLogout() {
        if (confirm('Sign out?')) {
            // Unsubscribe from real-time updates
            if (this.unsubscribe) {
                this.unsubscribe();
            }

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
    async submitFeedback() {
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

        try {
            const response = await fetch(`https://formspree.io/f/${formId}`, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

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
        } catch (error) {
            note.textContent = '❌ Error. Try again.';
            note.style.color = '#ff6b6b';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send Feedback';
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 DOMContentLoaded fired - initializing Daily Win Journal');
    
    try {
        // Wait for Firebase to initialize
        const firebaseReady = await window.firebaseReady;
        
        if (!firebaseReady || !window.db) {
            throw new Error('Firebase failed to initialize');
        }
        
        console.log('✅ Firebase ready, starting app');
        window.journal = new DailyWinJournal();
        console.log('✅ Journal initialized with Firebase');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        // Show error to user
        const authError = document.getElementById('authError');
        if (authError) {
            authError.textContent = '❌ Connection error. Please refresh the page.';
            authError.style.display = 'block';
        }
    }
});
