# Firebase Setup Instructions

Your RV Adventures app is now integrated with Firebase! Follow these steps to enable the required services:

## 1. Enable Firestore Database

1. Go to your [Firebase Console](https://console.firebase.google.com)
2. Select your project: **rv-adventures-b8eb8**
3. Click on **"Firestore Database"** in the left sidebar
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select a location (choose closest to you, e.g., `us-central`)
7. Click **"Enable"**

### Update Firestore Rules (Important!)

After creating the database, update the security rules:

1. Click on the **"Rules"** tab
2. Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true; // For now, allow all access
      // Later, you can add authentication and restrict to: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## 2. Enable Firebase Storage

1. In Firebase Console, click on **"Storage"** in the left sidebar
2. Click **"Get started"**
3. Choose **"Start in test mode"** (for development)
4. Select same location as Firestore
5. Click **"Done"**

### Update Storage Rules (Important!)

After creating storage, update the security rules:

1. Click on the **"Rules"** tab
2. Replace the rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /media/{userId}/{allPaths=**} {
      allow read, write: if true; // For now, allow all access
      // Later, you can add authentication and restrict to: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## 3. Test Your Setup

1. Open your RV Adventures website
2. Open browser Developer Tools (F12)
3. Go to the **Console** tab
4. You should see messages like:
   - `Firebase initialized successfully`
   - `Destinations loaded from Firebase`
   - `Folders loaded from Firebase`

## What's Now Saved to Firebase?

✅ **Firestore Database** stores:
- Destinations list (all your visited places)
- Folders organization
- Notes for each destination
- Metadata (dates, etc.)

✅ **Firebase Storage** stores:
- Photos (up to 10MB each)
- Videos (up to 10MB each)

## Data Migration

Your existing localStorage data will automatically serve as a fallback if Firebase isn't available. Once Firebase is enabled, new data will be saved there.

To migrate existing localStorage data to Firebase:
1. Make any small change to a destination (e.g., edit a note)
2. Click "Save"
3. The data will be synced to Firebase

## Future Enhancements

- Add user authentication (sign-in with Google/Email)
- Restrict data access to authenticated users
- Enable real-time sync across devices
- Add offline support with Firebase's cache

## Troubleshooting

**Issue**: "Permission denied" errors in console
**Solution**: Make sure you published the security rules in both Firestore and Storage

**Issue**: Media uploads failing
**Solution**: Check Storage rules and verify the bucket name matches your project

**Issue**: Data not loading
**Solution**: Check browser console for errors, ensure Firebase scripts are loading

## Need Help?

Check the Firebase documentation:
- [Firestore Setup](https://firebase.google.com/docs/firestore/quickstart)
- [Storage Setup](https://firebase.google.com/docs/storage/web/start)
