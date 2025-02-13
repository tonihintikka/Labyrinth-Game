import { auth, db } from './firebase-config.js';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

class AuthService {
    static currentUser = null;
    static isAdmin = false;
    static authStateListeners = [];

    static init() {
        onAuthStateChanged(auth, async (user) => {
            this.currentUser = user;
            if (user) {
                await this.checkAdminStatus();
            } else {
                this.isAdmin = false;
            }
            this.notifyAuthStateListeners();
        });
    }

    static async signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            // Create/update user profile
            await this.createUserProfile(userCredential.user, 'user');
            return userCredential.user;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    }

    static async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    static async createUserProfile(user, role) {
        const userRef = doc(db, 'users', user.uid);
        
        // Check if user already exists to preserve role
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            // Keep existing role if user exists
            role = userDoc.data().role;
        }

        await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: role,
            lastLogin: new Date().toISOString(),
            createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString()
        }, { merge: true });
    }

    static async checkAdminStatus() {
        if (!this.currentUser) {
            this.isAdmin = false;
            return false;
        }

        try {
            const userRef = doc(db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userRef);
            this.isAdmin = userDoc.exists() && userDoc.data().role === 'admin';
            return this.isAdmin;
        } catch (error) {
            console.error('Error checking admin status:', error);
            this.isAdmin = false;
            return false;
        }
    }

    static addAuthStateListener(listener) {
        this.authStateListeners.push(listener);
    }

    static removeAuthStateListener(listener) {
        this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    }

    static notifyAuthStateListeners() {
        const authState = {
            user: this.currentUser,
            isAdmin: this.isAdmin
        };
        this.authStateListeners.forEach(listener => listener(authState));
    }
}

export default AuthService;
