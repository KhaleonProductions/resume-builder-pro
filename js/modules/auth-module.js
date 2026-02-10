/**
 * Auth Module
 * Firebase Authentication wrapper
 * Reusable across applications
 */

class AuthModule {
  constructor(options = {}) {
    this.firebase = null;
    this.auth = null;
    this.currentUser = null;
    this.listeners = [];
    this.isInitialized = false;
    this.isPremium = false;

    // Callbacks
    this.onAuthStateChanged = options.onAuthStateChanged || null;
    this.onError = options.onError || null;
  }

  /**
   * Initialize Firebase
   * @param {object} firebaseConfig - Firebase configuration object
   */
  async init(firebaseConfig) {
    if (this.isInitialized) return;

    try {
      // Check if Firebase is loaded
      if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK not loaded. Include Firebase scripts first.');
      }

      // Initialize Firebase app if not already initialized
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      this.firebase = firebase;
      this.auth = firebase.auth();
      this.isInitialized = true;

      // Set up auth state listener
      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.notifyListeners(user);
        if (this.onAuthStateChanged) {
          this.onAuthStateChanged(user);
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Auth init error:', error);
      if (this.onError) this.onError(error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if auth is ready
   */
  isReady() {
    return this.isInitialized && this.auth !== null;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return this.currentUser !== null;
  }

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async signUp(email, password) {
    if (!this.isReady()) {
      return { success: false, error: 'Auth not initialized' };
    }

    try {
      const result = await this.auth.createUserWithEmailAndPassword(email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Sign up error:', error);
      if (this.onError) this.onError(error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async signIn(email, password) {
    if (!this.isReady()) {
      return { success: false, error: 'Auth not initialized' };
    }

    try {
      const result = await this.auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Sign in error:', error);
      if (this.onError) this.onError(error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    if (!this.isReady()) {
      return { success: false, error: 'Auth not initialized' };
    }

    try {
      const provider = new this.firebase.auth.GoogleAuthProvider();
      const result = await this.auth.signInWithPopup(provider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google sign in error:', error);
      if (this.onError) this.onError(error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    if (!this.isReady()) {
      return { success: false, error: 'Auth not initialized' };
    }

    try {
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   */
  async sendPasswordReset(email) {
    if (!this.isReady()) {
      return { success: false, error: 'Auth not initialized' };
    }

    try {
      await this.auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Update user profile
   * @param {object} profile - Profile data (displayName, photoURL)
   */
  async updateProfile(profile) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      await this.currentUser.updateProfile(profile);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user email
   * @param {string} newEmail - New email address
   */
  async updateEmail(newEmail) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      await this.currentUser.updateEmail(newEmail);
      return { success: true };
    } catch (error) {
      console.error('Update email error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   */
  async updatePassword(newPassword) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      await this.currentUser.updatePassword(newPassword);
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount() {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      await this.currentUser.delete();
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Get user ID token
   */
  async getIdToken() {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const token = await this.currentUser.getIdToken();
      return { success: true, token };
    } catch (error) {
      console.error('Get token error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add auth state listener
   * @param {function} callback - Callback function(user)
   */
  addListener(callback) {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(user) {
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Set premium status
   * @param {boolean} isPremium - Premium status
   */
  setPremiumStatus(isPremium) {
    this.isPremium = isPremium;
  }

  /**
   * Check premium status
   */
  checkPremium() {
    return this.isPremium;
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };

    return errorMessages[error.code] || error.message;
  }

  /**
   * Generate login form HTML
   */
  getLoginFormHTML() {
    return `
      <div class="auth-form">
        <h2>Sign In</h2>
        <form id="auth-login-form">
          <div class="auth-field">
            <label for="auth-email">Email</label>
            <input type="email" id="auth-email" required placeholder="your@email.com">
          </div>
          <div class="auth-field">
            <label for="auth-password">Password</label>
            <input type="password" id="auth-password" required placeholder="Password">
          </div>
          <div class="auth-error" id="auth-error"></div>
          <button type="submit" class="auth-btn auth-btn-primary">Sign In</button>
        </form>
        <div class="auth-divider"><span>or</span></div>
        <button type="button" class="auth-btn auth-btn-google" id="auth-google-btn">
          Sign in with Google
        </button>
        <div class="auth-links">
          <a href="#" id="auth-forgot-link">Forgot password?</a>
          <a href="#" id="auth-signup-link">Create account</a>
        </div>
      </div>
    `;
  }

  /**
   * Generate signup form HTML
   */
  getSignupFormHTML() {
    return `
      <div class="auth-form">
        <h2>Create Account</h2>
        <form id="auth-signup-form">
          <div class="auth-field">
            <label for="auth-email">Email</label>
            <input type="email" id="auth-email" required placeholder="your@email.com">
          </div>
          <div class="auth-field">
            <label for="auth-password">Password</label>
            <input type="password" id="auth-password" required placeholder="At least 6 characters">
          </div>
          <div class="auth-field">
            <label for="auth-password-confirm">Confirm Password</label>
            <input type="password" id="auth-password-confirm" required placeholder="Confirm password">
          </div>
          <div class="auth-error" id="auth-error"></div>
          <button type="submit" class="auth-btn auth-btn-primary">Create Account</button>
        </form>
        <div class="auth-links">
          <a href="#" id="auth-login-link">Already have an account? Sign in</a>
        </div>
      </div>
    `;
  }
}

// Export for ES6 modules
export { AuthModule };

// Export for non-module usage
if (typeof window !== 'undefined') {
  window.AuthModule = AuthModule;
}
