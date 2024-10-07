import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import app from './fb-config';

const auth = getAuth(app);

export const signup = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

export const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
};
