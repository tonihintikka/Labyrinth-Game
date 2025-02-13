import { db, rtdb } from './firebase-config.js';
import AuthService from './AuthService.js';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    ref,
    set,
    get,
    push,
    query as rtdbQuery,
    orderByChild,
    limitToFirst
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

class LevelStorage {
    // Local Storage Methods
    static saveLocalLevel(levelName, labyrinth) {
        const savedLevels = this.getLocalLevels();
        savedLevels[levelName] = labyrinth;
        localStorage.setItem('labyrinthLevels', JSON.stringify(savedLevels));
    }

    static getLocalLevels() {
        return JSON.parse(localStorage.getItem('labyrinthLevels') || '{}');
    }

    static saveLocalHighScore(levelName, time) {
        const highScores = this.getLocalHighScores();
        if (!highScores[levelName]) {
            highScores[levelName] = [];
        }
        highScores[levelName].push(time);
        highScores[levelName].sort((a, b) => a - b);
        highScores[levelName] = highScores[levelName].slice(0, 5); // Keep top 5
        localStorage.setItem('labyrinthHighScores', JSON.stringify(highScores));
    }

    static getLocalHighScores() {
        return JSON.parse(localStorage.getItem('labyrinthHighScores') || '{}');
    }

    // Firebase Methods
    static async saveLevelToFirebase(levelName, labyrinth) {
        if (!AuthService.isAdmin) {
            throw new Error('Only admins can save levels');
        }

        try {
            // Save to Firestore for metadata
            const levelRef = doc(db, 'levels', levelName);
            await setDoc(levelRef, {
                name: levelName,
                creator: AuthService.currentUser.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Save actual level data to Realtime Database
            const levelDataRef = ref(rtdb, `levels/${levelName}`);
            await set(levelDataRef, {
                data: labyrinth,
                updatedAt: new Date().toISOString()
            });

            // Backup to localStorage
            this.saveLocalLevel(levelName, labyrinth);
        } catch (error) {
            console.error('Error saving level to Firebase:', error);
            // Still save to localStorage even if Firebase fails
            this.saveLocalLevel(levelName, labyrinth);
            throw error;
        }
    }

    static async getLevelFromFirebase(levelName) {
        try {
            // Try Realtime Database first for level data
            const levelDataRef = ref(rtdb, `levels/${levelName}`);
            const snapshot = await get(levelDataRef);
            
            if (snapshot.exists()) {
                return snapshot.val().data;
            }
            
            // If not in Firebase, try localStorage
            const localLevels = this.getLocalLevels();
            return localLevels[levelName];
        } catch (error) {
            console.error('Error getting level from Firebase:', error);
            // Fallback to localStorage
            const localLevels = this.getLocalLevels();
            return localLevels[levelName];
        }
    }

    static async saveHighScoreToFirebase(levelName, time) {
        if (!AuthService.currentUser) {
            // If not logged in, only save locally
            this.saveLocalHighScore(levelName, time);
            return;
        }

        try {
            // Save to Realtime Database for better real-time updates
            const scoreRef = ref(rtdb, `scores/${levelName}`);
            const newScoreRef = push(scoreRef);
            await set(newScoreRef, {
                time,
                userId: AuthService.currentUser.uid,
                playerName: AuthService.currentUser.email,
                createdAt: new Date().toISOString()
            });

            // Also save to Firestore for better querying
            const scoreDocRef = doc(db, 'scores', `${levelName}_${AuthService.currentUser.uid}_${Date.now()}`);
            await setDoc(scoreDocRef, {
                levelName,
                time,
                userId: AuthService.currentUser.uid,
                playerName: AuthService.currentUser.email,
                createdAt: new Date().toISOString()
            });

            // Backup to localStorage
            this.saveLocalHighScore(levelName, time);
        } catch (error) {
            console.error('Error saving score to Firebase:', error);
            // Still save to localStorage even if Firebase fails
            this.saveLocalHighScore(levelName, time);
            throw error;
        }
    }

    static async getHighScoresFromFirebase(levelName) {
        try {
            // Get scores from Realtime Database for real-time updates
            const scoresRef = ref(rtdb, `scores/${levelName}`);
            const scoresQuery = rtdbQuery(scoresRef, orderByChild('time'), limitToFirst(5));
            const snapshot = await get(scoresQuery);
            
            const scores = [];
            snapshot.forEach((childSnapshot) => {
                scores.push(childSnapshot.val());
            });

            return scores;
        } catch (error) {
            console.error('Error getting scores from Firebase:', error);
            // Fallback to localStorage
            return this.getLocalHighScores()[levelName] || [];
        }
    }

    // Public API Methods - These are the methods that should be called by other parts of the application
    static async saveLevelToStorage(levelName, labyrinth) {
        await this.saveLevelToFirebase(levelName, labyrinth);
    }

    static async getSavedLevels() {
        try {
            // Get level metadata from Firestore
            const levelsRef = collection(db, 'levels');
            const querySnapshot = await getDocs(levelsRef);
            const levels = {};
            
            // Get actual level data from Realtime Database
            for (const doc of querySnapshot.docs) {
                const levelDataRef = ref(rtdb, `levels/${doc.id}`);
                const snapshot = await get(levelDataRef);
                if (snapshot.exists()) {
                    levels[doc.id] = snapshot.val().data;
                }
            }

            return levels;
        } catch (error) {
            console.error('Error getting levels from Firebase:', error);
            // Fallback to localStorage
            return this.getLocalLevels();
        }
    }

    static async saveHighScore(levelName, time) {
        await this.saveHighScoreToFirebase(levelName, time);
    }

    static async getHighScores(levelName) {
        return await this.getHighScoresFromFirebase(levelName);
    }

    // Sync Methods
    static async syncToFirebase() {
        if (!AuthService.currentUser) return;

        const localLevels = this.getLocalLevels();
        const localScores = this.getLocalHighScores();

        // Sync levels if admin
        if (AuthService.isAdmin) {
            for (const [levelName, labyrinth] of Object.entries(localLevels)) {
                try {
                    await this.saveLevelToFirebase(levelName, labyrinth);
                } catch (error) {
                    console.error(`Error syncing level ${levelName}:`, error);
                }
            }
        }

        // Sync scores
        for (const [levelName, times] of Object.entries(localScores)) {
            for (const time of times) {
                try {
                    await this.saveHighScoreToFirebase(levelName, time);
                } catch (error) {
                    console.error(`Error syncing score for ${levelName}:`, error);
                }
            }
        }
    }
}

export default LevelStorage;
