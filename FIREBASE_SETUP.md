# Firebase setup

The site is ready to use Firebase Authentication and Cloud Firestore. The Firebase project has not been created yet, so the live admin and enquiry storage will stay disabled until the project config is supplied.

## Create the Firebase project

1. In Firebase Console, create a project and register a Web app.
2. Create the **Cloud Firestore Standard** default database in **Mumbai (`asia-south1`)**. Firebase Console → Firestore → Add database is the simplest path.
3. In Authentication, enable **Email/Password**. Create the administrator account in the Firebase Console; the site has no public sign-up form.
4. Copy `.env.example` to `.env.local` and fill in the Web app config. These Firebase Web config values identify the project; the Firestore rules, not a hidden client key, enforce data access.
5. Add the local development hostname and the deployed website hostname under Authentication → Settings → Authorized domains.

## Grant the administrator role

After creating the administrator’s Authentication account, copy its UID and create `adminUsers/{UID}` in Firestore with this document:

```json
{ "enabled": true }
```

Only the project owner should create this record from Firebase Console. Client-side Firestore rules deny all writes to `adminUsers`, so a signed-in visitor cannot promote themselves.

## Deploy rules and indexes

From the repository root, install or use the Firebase CLI, select the real project, then deploy the default database rules and indexes:

```sh
npx firebase-tools login
npx firebase-tools use YOUR_FIREBASE_PROJECT_ID
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

Create the database first if you did not create it in the console:

```sh
npx firebase-tools firestore:databases:create "(default)" --location=asia-south1 --edition=standard
```

Then deploy the rules and indexes with the command above. Check that the console shows Standard edition and `asia-south1` before continuing. Do not commit service account JSON files or private keys.

## Use the CMS

Open `/admin`, sign in, then choose **Import current content** once to seed the existing projects, categories, client names, and testimonials. This imports text and existing local image path strings only; it does not upload image files. From then on, published Firestore text drives the portfolio, client loop and testimonials, and contact enquiries are saved privately in the `inquiries` collection.

To add a project or client in this text-only phase, its image path must refer to a file already present in the website assets before publishing. Image upload and cloud storage are intentionally a later step.

## Before accepting public traffic

Review the deployed rules in Firebase Console and enable Firebase App Check for the Web app (reCAPTCHA Enterprise or another supported provider) before relying on the public enquiry form. Firestore rules restrict who can read and write records, but they are not a rate limiter for anonymous enquiry submissions.

The following values are needed to connect this site: Firebase **Project ID**, **Web app API key**, **Auth domain**, **App ID**, and **Messaging sender ID**. Never send or commit a service account private key.
