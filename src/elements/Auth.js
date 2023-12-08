// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
	getAuth,
	signInWithRedirect,
	GoogleAuthProvider,
	getRedirectResult,
	signInWithPopup,
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
	collection,
	doc,
	getDoc,
	getFirestore,
	setDoc,
	updateDoc,
} from "firebase/firestore";
// import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDD-k0SvXPzA-p71-fAZgk23ABi11ckcVA",
	authDomain: "codepilot-eb63e.firebaseapp.com",
	projectId: "codepilot-eb63e",
	storageBucket: "codepilot-eb63e.appspot.com",
	messagingSenderId: "1010505637711",
	appId: "1:1010505637711:web:2669531180df669419ef3a",
	measurementId: "G-2NTY2F89C2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

var isLoaded = false;
var isSignedIn = false;
var currentUser = null;

export async function signInWithGoogle() {
	if (isLoaded && isSignedIn) {
		return;
	}
	const provider = new GoogleAuthProvider();
	provider.setCustomParameters({
		prompt: "select_account",
	});
	// get redirect result
	// Before
	// ==============
	const result = await signInWithRedirect(auth, provider);
	const credential = await getRedirectResult(auth);

	console.log(credential);
	// After
	// ==============
	// const userCred2 = await signInWithPopup(auth, provider);
}

export function isUserSignedIn() {
	return isSignedIn;
}

export function logOut() {
	auth.signOut();
}

export async function saveToFireStore(reports, todo, inprog, done) {
	// save to users/{uid}/reports
	// save to users/{uid}/todo
	// save to users/{uid}/inprog
	// save to users/{uid}/done

	try {
		const user = auth.currentUser;
		const uid = user.uid;
		const docRef = doc(db, "users", uid);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			console.log("Document data:", docSnap.data());
			// save to users/{uid}/reports
			updateDoc(docRef, {
				reports: JSON.stringify(reports),
				todo: JSON.stringify(todo),
				inprog: JSON.stringify(inprog),
				done: JSON.stringify(done),
			});
		} else {
			// doc.data() will be undefined in this case
			console.log("No such document!");

			// create new doc
			setDoc(doc(db, "users", uid), {
				reports: JSON.stringify(reports),
				todo: JSON.stringify(todo),
				inprog: JSON.stringify(inprog),
				done: JSON.stringify(done),
			});
		}
	} catch (e) {
		console.log(e);
	}
}

//on auth state change

export const Auth = (props) => {
	useEffect(() => {
		if (!isLoaded && auth && auth.currentUser != null) {
			isLoaded = true;
		}
		props.setAuthState(auth.currentUser);

		auth.onAuthStateChanged((user) => {
			console.log("auth state changed");
			if (user) {
				currentUser = user;
				isSignedIn = true;
				console.log("user signed in");
			} else {
				isSignedIn = false;
				console.log("user signed out");
			}
			isLoaded = true;
			props.setAuthState(user);
		});
	}, []);

	return null;
};

export { auth };
