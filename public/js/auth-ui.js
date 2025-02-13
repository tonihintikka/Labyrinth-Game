import AuthService from './AuthService.js';

class AuthUI {
    static init() {
        this.createAuthContainer();
        AuthService.addAuthStateListener(this.updateUI.bind(this));
        AuthService.init();
    }

    static createAuthContainer() {
        const container = document.createElement('div');
        container.id = 'auth-container';
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.padding = '10px';
        container.style.backgroundColor = '#f5f5f5';
        container.style.borderRadius = '5px';
        container.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';

        document.body.appendChild(container);
        this.updateUI({ user: null, isAdmin: false });
    }

    static updateUI(authState) {
        const container = document.getElementById('auth-container');
        if (!container) return;

        if (authState.user) {
            // User is logged in
            container.innerHTML = `
                <div style="text-align: center;">
                    ${authState.user.photoURL ? `
                        <img src="${authState.user.photoURL}" 
                             alt="Profile" 
                             style="width: 40px; height: 40px; border-radius: 50%; margin-bottom: 5px;">
                    ` : ''}
                    <p style="margin: 5px 0;">${authState.user.displayName || authState.user.email}</p>
                    ${authState.isAdmin ? '<span style="color: #007bff; display: block; margin-bottom: 5px;">(Admin)</span>' : ''}
                    <button id="logout-btn" style="
                        padding: 8px 16px;
                        background-color: #dc3545;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Logout</button>
                </div>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => AuthService.signOut());
        } else {
            // User is not logged in
            container.innerHTML = `
                <button id="google-signin-btn" style="
                    display: flex;
                    align-items: center;
                    padding: 10px 16px;
                    background-color: white;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: 'Roboto', sans-serif;
                    color: #757575;
                ">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                         alt="Google"
                         style="width: 18px; height: 18px; margin-right: 10px;">
                    Sign in with Google
                </button>
            `;

            document.getElementById('google-signin-btn').addEventListener('click', async () => {
                try {
                    await AuthService.signInWithGoogle();
                } catch (error) {
                    console.error('Google sign in failed:', error);
                    alert('Sign in failed: ' + error.message);
                }
            });
        }
    }
}

export default AuthUI;
