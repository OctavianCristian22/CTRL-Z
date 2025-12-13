import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  collection,
  addDoc, 
  query,
  where,
  getDocs,
  orderBy
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const createOrder = async (userId, orderData) => {
    const docRef = await addDoc(collection(db, "orders"), {
        userId,
        ...orderData,
        createdAt: new Date(),
        status: 'PENDING'
    });
    return docRef.id;
};

export const checkUsernameAvailability = async (username) => {
  const usernameRef = doc(db, "usernames", username.toLowerCase());
  const snap = await getDoc(usernameRef);
  return !snap.exists(); 
};

export const reserveUsername = async (username, uid) => {
  await setDoc(doc(db, "usernames", username.toLowerCase()), { uid });
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocument(result.user, { username: result.user.displayName, phone: "" });
    return result.user;
  } catch (error) {
    console.error("Eroare Google:", error);
    throw error;
  }
};

export const registerWithEmail = async (email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(result.user);
  return result;
};

export const createUserDocument = async (user, additionalData) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { email } = user;
    try {
      await setDoc(userRef, {
        email,
        createdAt: new Date(),
        ...additionalData 
      });
      if (additionalData.username) {
        await reserveUsername(additionalData.username, user.uid);
      }
    } catch (error) {
      console.error("Eroare DB", error);
    }
  }
  return userRef;
};

export const getUserDocument = async (uid) => {
  if (!uid) return null;
  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) return userSnap.data();
  } catch (error) {
    console.error("Eroare citire user", error);
  }
};

export const addReview = async (productId, reviewData) => {
    const safeId = String(productId);
    const docRef = await addDoc(collection(db, "reviews"), {
        productId: safeId,
        ...reviewData,
        createdAt: new Date()
    });
    return docRef.id;
};

export const getProductReviews = async (productId) => {
const safeId = String(productId);
    try {
        const q = query(
            collection(db, "reviews"), 
            where("productId", "==", safeId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("FIREBASE INDEX ERROR:", error);
        return []; 
    }
};

export const deleteReview = async (reviewId) => {
    await deleteDoc(doc(db, "reviews", reviewId));
};

export const updateReview = async (reviewId, newComment, newRating) => {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, { 
        comment: newComment,
        rating: newRating 
    });
};

export const updateUserProfile = (user, username) => updateProfile(user, { displayName: username });
export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = async () => signOut(auth);