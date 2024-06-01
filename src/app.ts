import { Filter, Firestore } from "firebase-admin/firestore";
import { applicationDefault, initializeApp } from "firebase-admin/app";

const main = async () => {
  initializeApp({
    credential: applicationDefault(),
  });

  const db = new Firestore();

  const usersQuery = db
    .collectionGroup("users")
    .where(
      Filter.or(
        Filter.where("isLogin", "==", true),
        Filter.where("isLastLogin", "==", true)
      )
    );
  const usersQuerySnap = await usersQuery.get();

  usersQuerySnap.forEach(async (doc) => {
    await doc.ref.update({
      isLastLogin: doc.data()?.isLogin,
      isLogin: false,
    });
  });
};

main();
