// Daily Win Journal App with Firebase Firestore Cloud Sync (+ localStorage fallback)
class DailyWinJournal {
    constructor() {
        console.log('📝 Journal Constructor called');
        this.wins = [];
        this.currentFilter = 'all';
        this.currentUser = null;
        this.isSignupMode = false;
        this.db = window.db;
        this.unsubscribe = null;
        this.useCloudSync = true; // Will be set to false if Firestore fails
        
        if (!this.db) {
            console.error('❌ Firebase Firestore not initialized');
            this.useCloudSync = false;
            this.showError('Using local storage only (Firebase not available)');
        } else {
            console.log('✅ Using Firebase Firestore');
        }
        
        this.checkLoginState();
        this.setupEventListeners();
    }

    showError(message) {
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.textContent = '⚠️ ' + message;
            errorDiv.style.display = 'block';
        }
    }

    // Check if user is already logged in
    checkLoginState() {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            this.currentUser = savedEmail;
            this.loadWinsFromCloud();
            this.showApp();
        }
    }

    // Set up all event listeners
    setupEventListeners() {
        console.log('⚙️ Setting up event listeners...');
        
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        console.log('loginBtn element:', loginBtn);
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                console.log('🔐 LOGIN BUTTON CLICKED!', e);
                this.handleLogin();
            });
            console.log('✅ Login button listener attached');
        } else {
            console.error('❌ loginBtn element not found!');
        }

        // Toggle signup/login mode
        const toggleSignup = document.getElementById('toggleSignup');
        console.log('toggleSignup element:', toggleSignup);
        
        if (toggleSignup) {
            toggleSignup.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Toggling signup mode');
                this.toggleSignupMode();
            });
            console.log('✅ Toggle signup listener attached');
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
            console.log('✅ Logout button listener attached');
        }

        // Win form
        const winForm = document.getElementById('winForm');
        if (winForm) {
            winForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addWin();
            });
            console.log('✅ Win form listener attached');
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
        console.log('✅ Filter buttons listeners attached');

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
        
        console.log('✅ All event listeners set up');
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

    // Hash password
    hashPassword(password) {
        return btoa(password + 'salt');
    }

    // Handle login/signup
    async handleLogin() {
        console.log('🔓 handleLogin called');
        
        const email = document.getElementById('userLoginEmail').value.trim().toLowerCase();
        const password = document.getElementById('userLoginPassword').value.trim();
        const errorDiv = document.getElementById('authError');

        console.log('Email:', email, 'Password length:', password.length);

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
            console.log('Attempting', this.isSignupMode ? 'signup' : 'login', 'for', email);
            
            // Try Firestore first
            if (this.useCloudSync && this.db) {
                try {
                    const userRef = this.db.collection('users').doc(email);
                    
                    if (this.isSignupMode) {
                        // Signup mode
                        const doc = await userRef.get();
                        if (doc.exists) {
                            errorDiv.textContent = '❌ This email already has an account. Try signing in.';
                            return;
                        }
                        
                        // Create new user in Firestore
                        console.log('Creating new user in Firestore...');
                        await userRef.set({
                            email: email,
                            password: hashedPassword,
                            createdAt: new Date(),
                            wins: []
                        });
                        
                        console.log('✅ User created in Firestore');
                        errorDiv.textContent = '✅ Account created! Signing in...';
                        errorDiv.style.color = '#51cf66';
                        
                        setTimeout(() => {
                            this.completeLogin(email, errorDiv);
                        }, 1000);
                        return;
                    } else {
                        // Login mode
                        console.log('Checking user in Firestore...');
                        const doc = await userRef.get();
                        if (!doc.exists) {
                            errorDiv.textContent = '❌ Email not found. Create an account first.';
                            return;
                        }

                        if (doc.data().password !== hashedPassword) {
                            errorDiv.textContent = '❌ Incorrect password.';
                            return;
                        }

                        console.log('✅ Firestore login successful');
                        this.completeLogin(email, errorDiv);
                        return;
                    }
                } catch (firestoreError) {
                    console.warn('Firestore error:', firestoreError.message);
                    
                    // If it's an offline error, fall back to localStorage
                    if (firestoreError.message.includes('offline')) {
                        console.log('Firestore offline - using localStorage fallback');
                        this.useCloudSync = false;
                        // Continue to localStorage logic below
                    } else {
                        errorDiv.textContent = '❌ Error: ' + firestoreError.message;
                        return;
                    }
                }
            }
            
            // Fallback: Use localStorage only
            console.log('Using localStorage for authentication');
            const usersJson = localStorage.getItem('__users__');
            const users = usersJson ? JSON.parse(usersJson) : {};
            
            if (this.isSignupMode) {
                // Signup
                if (users[email]) {
                    errorDiv.textContent = '❌ This email already has an account. Try signing in.';
                    return;
                }
                users[email] = hashedPassword;
                localStorage.setItem('__users__', JSON.stringify(users));
                
                console.log('✅ User created in localStorage');
                errorDiv.textContent = '✅ Account created! Signing in...';
                errorDiv.style.color = '#51cf66';
                
                setTimeout(() => {
                    this.completeLogin(email, errorDiv);
                }, 1000);
            } else {
                // Login
                if (!users[email]) {
                    errorDiv.textContent = '❌ Email not found. Create an account first.';
                    return;
                }
                if (users[email] !== hashedPassword) {
                    errorDiv.textContent = '❌ Incorrect password.';
                    return;
                }
                
                console.log('✅ localStorage login successful');
                this.completeLogin(email, errorDiv);
            }
            
        } catch (error) {
            console.error('Auth error:', error);
            errorDiv.textContent = '❌ Error: ' + error.message;
        }
    }

    // Complete login
    completeLogin(email, errorDiv) {
        this.currentUser = email;
        localStorage.setItem('userEmail', email);
        errorDiv.textContent = '';
        errorDiv.style.color = '';
        
        this.loadWinsFromCloud();
        this.showApp();
    }

    // Load wins from cloud
    loadWinsFromCloud() {
        try {
            if (this.unsubscribe) {
                this.unsubscribe();
            }

            // If Firestore isn't available, use localStorage only
            if (!this.useCloudSync || !this.db) {
                console.log('Loading from localStorage (no Firestore)');
                this.loadWinsLocal();
                return;
            }

            // Try real-time listener
            this.unsubscribe = this.db.collection('users').doc(this.currentUser)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        this.wins = doc.data().wins || [];
                        this.render();
                        this.updateStats();
                        console.log('✅ Wins synced from Firestore');
                    }
                }, (error) => {
                    console.warn('Firestore listener error:', error.message);
                    
                    // If offline, switch to localStorage
                    if (error.message.includes('offline')) {
                        this.useCloudSync = false;
                        console.log('Firestore offline - switching to localStorage');
                    }
                    
                    this.loadWinsLocal();
                });

        } catch (error) {
            console.error('Cloud load error:', error);
            this.loadWinsLocal();
        }
    }

    // Fallback: Load from localStorage
    loadWinsLocal() {
        const saved = localStorage.getItem(`wins_${this.currentUser}`);
        this.wins = saved ? JSON.parse(saved) : [];
        console.log('Loaded', this.wins.length, 'wins from localStorage');
        this.render();
        this.updateStats();
    }

    // Save wins to cloud (with localStorage fallback)
    async saveWins() {
        // Always save locally
        localStorage.setItem(`wins_${this.currentUser}`, JSON.stringify(this.wins));
        
        // Try to save to Firestore if available
        if (this.useCloudSync && this.db) {
            try {
                await this.db.collection('users').doc(this.currentUser).update({
                    wins: this.wins,
                    updatedAt: new Date()
                });
                console.log('✅ Synced to Firestore');
            } catch (error) {
                console.warn('Firestore save error:', error.message);
                
                // If offline, mark for later sync
                if (error.message.includes('offline')) {
                    console.log('⚠️ Firestore offline - saved locally only');
                    this.useCloudSync = false;
                }
            }
        }
    }

    // Add a win
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

    // Render wins
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

    // Update stats
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

    // Calculate streak
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

    // Clear all wins
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
        text += `\n🚀 Keep winning!`;
        
        return text;
    }

    // Show app
    showApp() {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        document.getElementById('userEmail').textContent = `Signed in as: ${this.currentUser}`;
        this.render();
        this.updateStats();
    }

    // Logout
    handleLogout() {
        if (confirm('Sign out?')) {
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

        if (!toggle || !modal || !close || !form) return;

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded fired');
    console.log('window.db:', window.db);
    console.log('firebase:', window.firebase);
    
    // Wait for Firebase
    setTimeout(() => {
        console.log('Checking Firebase after 1 second...');
        console.log('window.db:', window.db);
        
        if (window.db) {
            console.log('✅ Firebase ready - initializing journal');
            window.journal = new DailyWinJournal();
            console.log('✅ Journal created');
        } else {
            console.error('❌ Firebase not ready after 1 second');
            const errorDiv = document.getElementById('authError');
            if (errorDiv) {
                errorDiv.textContent = '❌ Firebase connection failed. Check your internet.';
                errorDiv.style.display = 'block';
            }
        }
    }, 1000);
});
