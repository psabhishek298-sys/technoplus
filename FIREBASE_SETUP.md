# Firebase and Cloudinary setup

The site is connected to Firebase project `technoplus-eb80f`. Firestore is Standard in Mumbai (`asia-south1`), its security rules are published, and the admin role is granted to the Authentication user created for the CMS.

## Local environment

Keep project credentials in the ignored `.env.local` file. Copy `.env.example` as a starting point. Firebase Web config values identify the public web app; Firestore Security Rules enforce data access. Never put a Firebase service account or Cloudinary API secret in a `VITE_` variable.

## Cloudinary images

The Cloudinary account uses cloud name `vpi7w3h5` and the unsigned image upload preset `technoplus_admin_images`. The preset saves new files in the `technoplus` folder, disallows user-specified public IDs, and generates random IDs. Its name and cloud name are public client configuration, not secrets. All 62 images currently in `public/photos` have been uploaded to Cloudinary and their site references now use Cloudinary CDN URLs.

Set these in `.env.local` and restart Vite after changes:

```dotenv
VITE_CLOUDINARY_CLOUD_NAME=vpi7w3h5
VITE_CLOUDINARY_UPLOAD_PRESET=technoplus_admin_images
```

The admin uploader accepts JPG, PNG, WebP and AVIF up to 10 MB. Project cover, hero and gallery images plus client logos upload to Cloudinary; the returned secure URLs are saved with their text data in Firestore. Removing a URL removes it from the website record; the corresponding Cloudinary asset is not deleted because Cloudinary deletion requires a signed server-side request.

Unsigned upload preset names are discoverable in browser code. The admin UI requires Firebase admin sign-in, but that alone does not stop someone from calling Cloudinary's unsigned endpoint directly. For a production site with stronger upload protection, use a server-side signed upload endpoint, or keep the Cloudinary preset tightly restricted and monitor usage. Do not use the Cloudinary API secret in browser code.

## CMS use

Open `/admin` and sign in with the Firebase Authentication account. Select **Import current content** once to seed the current projects, categories, clients and testimonials. Then use the Projects or Clients editor to upload images; text and Cloudinary secure URLs are stored in Firestore. Contact enquiries are kept private in the `inquiries` collection.

The Firestore Rules deny client-side changes to `adminUsers`; project owners should grant or revoke admin roles in the Firebase Console. Add any deployed site hostname under Authentication → Settings → Authorized domains. Before accepting public traffic, enable Firebase App Check and review the deployed Firestore rules. Rules restrict access but do not rate limit anonymous enquiry submissions.
