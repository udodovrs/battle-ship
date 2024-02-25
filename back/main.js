import { DB } from "./DB/db.js";
import { regAndAythUser, updateWinners } from "./controller/users.js";
import {
  getRoomsWithOnePlayer,
  createRoom,
  addUserToRoom,
} from "./controller/rooms.js";
import {
  createGame,
  startGame,
  turn,
  checkWhoturn,
} from "./controller/game.js";
import { fighting } from "./controller/fighting.js";
import { createSinglePlay } from "./controller/single-play.js";

export const User = new DB("users");
export const Room = new DB("rooms");
export const Game = new DB("games");

export const main = async (data, userId) => {
  console.log(data);

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
    case "add_user_to_room": {
      const isAdduser = await addUserToRoom(data, userId);
      if (isAdduser) {
        const { create_game, players } = await createGame(userId, data);
        const rooms = isAdduser ? await getRoomsWithOnePlayer() : null;
        return {
          res_person: null,
          res_all: [rooms],
          res_gameRoom: create_game,
          payload: { players, isAdduser },
        };
      } else {
        return {
          res_person: null,
          res_all: null,
          res_gameRoom: null,
          payload: { players: null, isAdduser },
        };
      }
    }
    case "add_ships": {
      const { start_game, players } = await startGame(data);
      const turnData = await turn(data);
      return {
        res_person: null,
        res_all: null,
        res_gameRoom: { start_game, turnData },
        payload: players,
      };
    }
    case "attack":
    case "randomAttack": {
      const whoTurn = await checkWhoturn(data);
      if (whoTurn) {
        const { res, players, turnData, finish } = await fighting(data);
        let rooms = null;
        let wins = null;
        if (finish) {
          wins = await updateWinners();
          rooms = await getRoomsWithOnePlayer();
        }
        return {
          res_person: null,
          res_all: { rooms, wins },
          res_gameRoom: { res, turnData, finish },
          payload: players,
        };
      } else {
        return { res: null, players: null, turnData: null, finish: null };
      }
    }
    case "single_play": {
      const res = await createSinglePlay(userId);
      return {
        res_person: res,
        res_all: null,
        res_gameRoom: null,
        payload: null,
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
