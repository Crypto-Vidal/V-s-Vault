# Firebase Setup Instructions

This guide will help you set up Firebase authentication for your portfolio website.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "my-portfolio")
4. Continue through the setup (you can disable Google Analytics if you don't need it)
5. Click "Create project"

## Step 2: Enable Google Authentication

1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click "Get started" if you haven't set up Authentication yet
3. Go to the "Sign-in method" tab
4. Click on "Google" in the providers list
5. Toggle "Enable" to ON
6. Enter a support email (your email)
7. Click "Save"

## Step 3: Set Up Firestore Database

1. In the left sidebar, click on "Firestore Database"
2. Click "Create database"
3. Choose "Start in **test mode**" for now (you can add security rules later)
4. Select your preferred location
5. Click "Enable"

## Step 4: Get Your Firebase Configuration

1. In the Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon (`</>`) to add a web app
5. Give your app a nickname (e.g., "Portfolio Website")
6. Click "Register app"
7. Copy the `firebaseConfig` object - it will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

## Step 5: Add Configuration to Your Website

1. Open `portfolio.html` in your code editor
2. Find this section near the bottom (around line 578):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace it with your actual Firebase config from Step 4
4. Save the file

## Step 6: Add Authorized Domain (For Production)

When you deploy your site, you need to authorize your domain:

1. In Firebase Console, go to "Authentication"
2. Click on the "Settings" tab
3. Scroll to "Authorized domains"
4. Click "Add domain"
5. Enter your domain (e.g., `yourdomain.com` or your hosting URL)
6. Click "Add"

## Step 7: Test Your Login

1. Open your website
2. Click the "Admin Login" button (bottom right)
3. Click "Sign in with Google"
4. Choose your Google account
5. You should now be logged in and see the edit controls!

## Security Rules (Recommended)

After testing, update your Firestore security rules:

1. Go to Firestore Database in Firebase Console
2. Click on the "Rules" tab
3. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow authenticated users to read videos
    match /videos/{video} {
      allow read: if true;  // Anyone can read
      allow write: if request.auth != null;  // Only logged-in users can write
      allow delete: if request.auth != null;  // Only logged-in users can delete
    }
  }
}
```

4. Click "Publish"

## How to Use

### Adding Videos
1. Log in with Google
2. Click "+ Add Video" in the edit panel
3. Enter the YouTube video ID (from the URL: `youtube.com/watch?v=VIDEO_ID`)
4. Add a title and description
5. Click "Add Video"

### Deleting Videos
1. While logged in, hover over any video
2. Click the red "Delete" button
3. Confirm deletion

### Logging Out
1. Click the "Logout" button in the edit panel

## Troubleshooting

**Error: "auth/unauthorized-domain"**
- Make sure your domain is added to Authorized domains in Firebase Console

**Videos not loading**
- Check that Firestore is enabled and in test mode
- Check browser console for errors

**Login popup blocked**
- Allow popups for your website
- Check that Google sign-in is enabled in Firebase Console

**Changes not saving**
- Check Firestore security rules allow writes from authenticated users
- Check browser console for errors

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth/web/start)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
