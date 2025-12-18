import { getDB } from "../db/mongo";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { COLLECTION_TRAINERS } from "../utils";


export const createTrainer = async (name: string, password: string) => {
  const db = getDB();
  const exists = await db.collection(COLLECTION_TRAINERS).findOne({ name });
  if (exists) throw new Error("Trainer already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.collection(COLLECTION_TRAINERS).insertOne({
    name,
    password: hashedPassword,
    pokemons: [], 
  });

  return result.insertedId.toString();
};


export const validateTrainer = async (name: string, password: string) => {
  const db = getDB();
  const trainer = await db.collection(COLLECTION_TRAINERS).findOne({ name });
  if (!trainer) return null;

  const ok = await bcrypt.compare(password, trainer.password);
  if (!ok) return null;

  return trainer;
};


export const findTrainerById = async (id: string) => {
  const db = getDB();
  return await db.collection(COLLECTION_TRAINERS).findOne({
    _id: new ObjectId(id),
  });
};
