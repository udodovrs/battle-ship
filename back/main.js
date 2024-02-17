import { DB } from "./DB/db.js";
import { regAndAythUser, updateWinners } from "./controller/users.js";
import {
  getRoomsWithOnePlayer,
  createRoom,
  addUserToRoom,
} from "./controller/rooms.js";
import { createGame, startGame, turn } from "./controller/game.js";
import { fighting } from "./controller/figting.js";

export const User = new DB("users");
export const Room = new DB("rooms");
export const Game = new DB("games");

export const main = async (data, userId) => {
  console.log(data);

  let summ = 0;

  switch (data.type) {
    case "reg":
      const { user, _id } = await regAndAythUser(data);
      const wins = await updateWinners();
      return {
        res_person: user,
        res_all: [await getRoomsWithOnePlayer(), wins],
        res_gameRoom: null,
        payload: _id,
      };
    case "create_room":
      await createRoom(userId);
      return {
        res_person: null,
        res_all: [await getRoomsWithOnePlayer()],
        res_gameRoom: null,
        payload: null,
      };
    case "add_user_to_room":
      await addUserToRoom(data, userId);
      const { create_game, players } = await createGame(userId);
      return {
        res_person: null,
        res_all: [await getRoomsWithOnePlayer()],
        res_gameRoom: create_game,
        payload: players,
      };
    case "add_ships": {
      const { start_game, players } = await startGame(data);
      const turnData = await turn(data)
      return {
        res_person: null,
        res_all: null,
        res_gameRoom: {start_game, turnData},
        payload: players,
      };
    }
    case "attack": {
      const { res, player } = await fighting(data);
      return {
        res_person: null,
        res_all: null,
        res_gameRoom: res,
        payload: player,
      };
    }
    default:
      console.error(`Unknown type`);
      return {
        res_person: null,
        res_all: null,
        res_gameRoom: null,
        payload: null,
      };
  }
};
