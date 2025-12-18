import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_OWNED, COLLECTION_POKEMONS, COLLECTION_TRAINERS,} from "../utils";

export const catchPokemonForTrainer = async ( trainerId: string, pokemonId: string, nickname?: string) => {
 const db = getDB();
 const pokemon = await db.collection(COLLECTION_POKEMONS).findOne({ _id: new ObjectId(pokemonId) });
 if (!pokemon) throw new Error("Pokemon no existente");

 const trainer = await db.collection(COLLECTION_TRAINERS).findOne({ _id: new ObjectId(trainerId) });
 if (!trainer) throw new Error("Trainer no existente");
 if (trainer.pokemons.length >= 6) throw new Error("No puedes tener mas de 6 pokemons");

 const result = await db.collection(COLLECTION_OWNED).insertOne({
   trainerId,
   pokemonId,
   nickname: nickname || pokemon.name,
   attack:1,
   defense: 1,
   speed:1,
   special: 1,
   level: 1,
 });

 const ownedId = result.insertedId.toString();

 await db.collection(COLLECTION_TRAINERS).updateOne(
   { _id: new ObjectId(trainerId) },
   { $addToSet: { pokemons: ownedId } }
 );

 return await db.collection(COLLECTION_OWNED).findOne({
   _id: new ObjectId(ownedId),
 });
};


export const freeOwnedPokemon = async (trainerId: string, ownedPokemonId: string) => {
 const db = getDB();

  const owned = await db.collection(COLLECTION_OWNED).findOne({
    _id: new ObjectId(ownedPokemonId),
  });

  if (!owned) throw new Error("OwnedPokemon no existente");
  if (owned.trainerId !== trainerId)
    throw new Error("No puedes liberar un pokemon que no es tuyo");

  await db.collection(COLLECTION_OWNED).deleteOne({
    _id: new ObjectId(ownedPokemonId),
  });

  await db.collection(COLLECTION_TRAINERS).updateOne(
    { _id: new ObjectId(trainerId) },
    { $pull: { pokemons: ownedPokemonId } as any }
  );

  return await db.collection(COLLECTION_TRAINERS).findOne({
    _id: new ObjectId(trainerId),
  });
};



