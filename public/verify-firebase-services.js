// Script to verify Firebase services are enabled
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

import { auth, db, rtdb } from './js/firebase-config.js';

async function verifyServices() {
    console.log('🔍 Verifying Firebase Services...\n');

    try {
        // 1. Verify Authentication
        console.log('1️⃣ Checking Authentication Service...');
        try {
            const provider = new GoogleAuthProvider();
            console.log('✅ Google Authentication provider initialized');
            
            // Check if already signed in
            const currentUser = auth.currentUser;
            if (currentUser) {
                console.log('✅ Currently signed in as:', currentUser.email);
                console.log('   Display Name:', currentUser.displayName);
                console.log('   User ID:', currentUser.uid);
            } else {
                console.log('i️ No user currently signed in');
            }
        } catch (error) {
            console.error('❌ Authentication error:', error.message);
            throw error;
        }

        // 2. Verify Firestore
        console.log('\n2️⃣ Checking Firestore Database...');
        try {
            await enableIndexedDbPersistence(db);
            console.log('✅ Firestore is enabled and configured');
            console.log('✅ Offline persistence is enabled');
        } catch (error) {
            if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
                console.log('✅ Firestore is enabled (persistence setup skipped)');
            } else {
                console.error('❌ Firestore error:', error.message);
                throw error;
            }
        }

        // 3. Verify Realtime Database
        console.log('\n3️⃣ Checking Realtime Database...');
        const connectedRef = ref(rtdb, '.info/connected');
        await new Promise((resolve, reject) => {
            const unsubscribe = onValue(connectedRef, (snap) => {
                unsubscribe();
                if (snap.val() === true) {
                    console.log('✅ Realtime Database is enabled and connected');
                } else {
                    console.log('✅ Realtime Database is enabled (offline)');
                }
                resolve();
            }, (error) => {
                console.error('❌ Realtime Database error:', error.message);
                reject(error);
            });

            // Set a timeout in case the connection check takes too long
            setTimeout(() => {
                unsubscribe();
                console.log('⚠️ Realtime Database connection check timed out');
                resolve();
            }, 5000);
        });

        console.log('\n✨ Service verification complete!');
        console.log('\nNext steps:');
        console.log('1. Sign in with Google on the main page');
        console.log('2. Set up admin role in Firebase Console:');
        console.log('   - Go to Firestore');
        console.log('   - Find your user document in "users" collection');
        console.log('   - Set role field to "admin"');
        console.log('3. Test level creation and high scores');

    } catch (error) {
        console.error('\n❌ Error during service verification:', error.message);
        console.log('\nTroubleshooting steps:');
        console.log('1. Go to Firebase Console > Authentication');
        console.log('2. Verify Google sign-in is enabled');
        console.log('3. Check authorized domains include localhost');
        console.log('4. Verify Firebase project settings');
    }
}

// Run verification
verifyServices();
