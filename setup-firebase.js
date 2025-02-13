const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const CONFIG_TEMPLATE = `// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "{{API_KEY}}",
  authDomain: "{{PROJECT_ID}}.firebaseapp.com",
  databaseURL: "https://{{PROJECT_ID}}-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "{{PROJECT_ID}}",
  storageBucket: "{{PROJECT_ID}}.firebasestorage.app",
  messagingSenderId: "{{MESSAGING_SENDER_ID}}",
  appId: "{{APP_ID}}"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { auth, db, rtdb };`;

console.log('\nFirebase Configuration Setup\n');
console.log('Please enter your Firebase configuration values from the Firebase Console.');
console.log('You can find these in Project Settings > General > Your Apps.\n');

const questions = [
    { key: 'API_KEY', prompt: 'Enter your API Key:' },
    { key: 'PROJECT_ID', prompt: 'Enter your Project ID:' },
    { key: 'MESSAGING_SENDER_ID', prompt: 'Enter your Messaging Sender ID:' },
    { key: 'APP_ID', prompt: 'Enter your App ID:' }
];

let config = CONFIG_TEMPLATE;

function askQuestion(index) {
    if (index >= questions.length) {
        writeConfigFile();
        return;
    }

    const question = questions[index];
    rl.question(`${question.prompt} `, (answer) => {
        // If this is PROJECT_ID, update all occurrences
        if (question.key === 'PROJECT_ID') {
            config = config.replace(/{{PROJECT_ID}}/g, answer);
        } else {
            config = config.replace(`{{${question.key}}}`, answer);
        }
        askQuestion(index + 1);
    });
}

function writeConfigFile() {
    const configPath = path.join(__dirname, 'public', 'js', 'firebase-config.js');
    
    fs.writeFile(configPath, config, 'utf8', (err) => {
        if (err) {
            console.error('Error writing configuration file:', err);
            process.exit(1);
        }
        
        console.log('\nFirebase configuration has been saved to:', configPath);
        console.log('\nNext steps:');
        console.log('1. Deploy the security rules from firebase-rules.txt to your Firestore');
        console.log('2. Start the application and create your first user');
        console.log('3. Go to Firestore and set that user\'s role to "admin"\n');
        
        rl.close();
    });
}

// Start the configuration process
askQuestion(0);
