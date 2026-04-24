const admin = require('firebase-admin');

const initFirebase = () => {
    // FIX: apps (not app)
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });

        console.log('Firebase Admin Initialized');
    }

    console.log('Firebase Called');

    return admin;
};

module.exports = initFirebase;