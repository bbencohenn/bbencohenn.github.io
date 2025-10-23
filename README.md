# bbencohenn.github.io

## Blog & Admin

- Blog page: `blog.html` lists posts with filters and a modal reader.
- Data source: defaults to `data/blog.json` (static, works on GitHub Pages).
- Search: the Ctrl/Cmd+K command palette indexes pages and blog posts.

### Admin (Firebase-backed)

`admin.html` provides a secure GUI to add/edit/delete posts using Firebase Auth + Firestore + optional Storage for image uploads.

Setup:
- Create a Firebase project (Web app) and enable Authentication (Google) and Firestore (native mode). Optional: enable Storage.
- Put your config into `js/firebase-config.js` and optionally add your admin UID(s) to `ADMIN_UIDS`.
- Open `admin.html`, sign in, and manage posts.
- Use â€œExport JSONâ€ to download data compatible with `data/blog.json` for the public site.

Firestore security (example - adjust to your needs):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{doc} {
      allow read: if true; // public read
      allow write: if request.auth != null &&
                   request.auth.uid in ['YOUR_ADMIN_UID'];
    }
  }
}
```

Storage security (example):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /blog-images/{uid}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Notes:
- If you prefer fully static hosting, manage content in Firebase and export to JSON to commit `data/blog.json`.
- The command palette auto-indexes blog posts from `data/blog.json`.


