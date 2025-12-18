import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "./db/mongo";
import { COLLECTION_TRAINERS } from "./utils";

dotenv.config();

const SUPER_SECRET = process.env.SUPER_SECRET;

type TokenPayload = {
  trainerId: string;
};

export const signToken = (trainerId: string) => {
  return jwt.sign({ trainerId }, SUPER_SECRET!, { expiresIn: "1h" });
};

const verifyToken = (token: string): TokenPayload | null => {
  try {
    if(!SUPER_SECRET) throw new Error ("SECRET is not defined");
    return jwt.verify(token, SUPER_SECRET!) as TokenPayload;
  } catch (err){
    return null;
  }
};

export const getTrainerFromToken = async (token: string) => {
  const payload = verifyToken(token);
  if (!payload) return null;

  const db = getDB();
  return await db.collection(COLLECTION_TRAINERS).findOne({
    _id: new ObjectId(payload.trainerId),
  });
};
