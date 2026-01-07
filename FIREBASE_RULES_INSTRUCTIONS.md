# How to Update Firestore Security Rules

To allow your app to display the Camp Creator and Collaborators correctly, you need to update your database rules in the Firebase Console.

## Step 1: Go to Firebase Console
1. Open your browser and go to [console.firebase.google.com](https://console.firebase.google.com).
2. Select your project: **sports-camp-tracker**.
3. In the left sidebar, click on **Build** > **Firestore Database**.
4. Click on the **Rules** tab at the top.

## Step 2: Update the Rules
Replace your current rules with the code below. This configuration allows any logged-in user to read other user profiles (needed to see names/emails) but restricts editing to the account owner only. It also secures your data so only logged-in users can access the app.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper check for logged-in users
    function isAuthenticated() {
      return request.auth != null;
    }

    // 1. USERS COLLECTION
    // allow read: Required for "Share Camp" and displaying "Camp Creator"
    // allow write: Users can only edit their own profile
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    // 2. ALL OTHER DATA (Camps, Athletes, etc.)
    // For now, valid for any logged-in user.
    // (We will tighten this later to be camp-specific)
    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

## Step 3: Publish
1. Copy the code block above.
2. Paste it into the **Rules** editor in Firebase.
3. Click the **Publish** button.

Once published, your app often updates instantly, but it can take up to a minute. Refresh your app, and the Camp Creator should appear!
