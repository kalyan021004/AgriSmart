const initFirebase = require('../config/firebase');

const admin = initFirebase();

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken =
      await admin.auth().verifyIdToken(idToken);

    req.firebaseUser = decodedToken;

    next();

  } catch (error) {
    console.error(
      'Firebase token error:',
      error.message
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = { verifyFirebaseToken };