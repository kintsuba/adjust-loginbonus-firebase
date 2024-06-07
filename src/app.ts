import { Filter, Firestore } from "firebase-admin/firestore";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { api } from "misskey-js";
import moment from "moment";
import "moment/locale/ja.js";
import "dotenv/config";

if (!process.env.MISSKEY_TOKEN) {
  console.error("Make .env file.");
  process.exit(-1);
}

const main = async () => {
  initializeApp({
    credential: applicationDefault(),
  });

  const db = new Firestore();

  const host = "https://misskey.m544.net";
  const cli = new api.APIClient({
    origin: host,
    credential: process.env.MISSKEY_TOKEN,
  });

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

  const result = await cli
    .request("notes/create", {
      text: `5時になったので、**${moment()
        .add(9, "h")
        .format("M月D日")}**のログインボーナスが受け取れるようになりました。`,
      visibility: "home",
    })
    .catch((error) => console.error("", error));

  console.debug(result);
};

main();
