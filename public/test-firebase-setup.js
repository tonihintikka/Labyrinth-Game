// Test script to verify Firebase configuration and connectivity
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Load Firebase config
import { auth, db, rtdb } from './js/firebase-config.js';

async function testFirebaseSetup() {
    console.log('🔍 Testing Firebase Configuration...\n');

    try {
        // Test Authentication
        console.log('1️⃣ Testing Authentication...');
        const authInstance = getAuth();
        console.log('✅ Authentication initialized successfully');

        // Test Google Auth Provider
        try {
            const provider = new GoogleAuthProvider();
            console.log('✅ Google Authentication provider configured');
        } catch (error) {
            console.error('❌ Google Authentication provider error:', error.message);
            throw error;
        }

        // Test Firestore
        console.log('\n2️⃣ Testing Firestore...');
        const firestoreDb = getFirestore();
        try {
            await getDoc(doc(firestoreDb, 'test', 'test'));
            console.log('✅ Firestore connection successful');
        } catch (error) {
            if (error.code === 'permission-denied') {
                console.log('✅ Firestore security rules are active');
            } else {
                console.error('❌ Firestore error:', error.message);
                throw error;
            }
        }

        // Test Realtime Database
        console.log('\n3️⃣ Testing Realtime Database...');
        const database = getDatabase();
        try {
            await get(ref(database, 'test'));
            console.log('✅ Realtime Database connection successful');
        } catch (error) {
            if (error.code === 'PERMISSION_DENIED') {
                console.log('✅ Realtime Database security rules are active');
            } else {
                console.error('❌ Realtime Database error:', error.message);
                throw error;
            }
        }

        console.log('\n✨ All Firebase services initialized successfully!');
        console.log('\nNext steps:');
        console.log('1. Verify Google sign-in works on the main page');
        console.log('2. Make your Google account admin in Firebase Console');
        console.log('3. Test level creation and high scores');

    } catch (error) {
        console.error('\n❌ Error during Firebase setup test:', error.message);
        console.log('\nTroubleshooting steps:');
        console.log('1. Check firebase-config.js values');
        console.log('2. Verify Firebase project settings');
        console.log('3. Ensure Google Authentication is enabled in Firebase Console');
        console.log('4. Check browser console for detailed errors');
    }
}

// Run the test
testFirebaseSetup();
