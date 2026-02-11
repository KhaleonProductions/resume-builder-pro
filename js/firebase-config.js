/**
 * Firebase Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Click "Create a project" (or select existing)
 * 3. Name it "resume-builder-pro" and continue
 * 4. Disable Google Analytics (optional) and create project
 * 5. Click the web icon (</>) to add a web app
 * 6. Register app name: "Resume Builder Pro"
 * 7. Copy your config values below
 * 8. Enable Authentication:
 *    - Go to Authentication > Sign-in method
 *    - Enable "Email/Password"
 *    - Enable "Google" (add your email as project support email)
 * 9. Enable Firestore:
 *    - Go to Firestore Database
 *    - Click "Create database"
 *    - Start in "test mode" for development
 *    - Choose a region close to your users
 */

const firebaseConfig = {
    apiKey: "AIzaSyBQG8w4B6rr29kzpP8MF3awFDOC_YSLuKg", 
    authDomain: "resume-builder-pro-b7a54.firebaseapp.com",
    projectId: "resume-builder-pro-b7a54",
    storageBucket: "resume-builder-pro-b7a54.firebasestorage.app",
    messagingSenderId: "823690597083",
    appId: "1:823690597083:web:b7120d24aa135e9c5932fe",
    measurementId: "G-68M6FNJ7F3"
};

// Initialize Firebase when config is ready
function initializeFirebase() {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.log("Firebase not configured. See js/firebase-config.js for setup instructions.");
    return false;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
    return true;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return false;
  }
}

// Export config
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
  window.initializeFirebase = initializeFirebase;
}
