import { usersOnBoard } from "../../index.js";
import { Game, Room } from "../main.js";

const getFinishResponse = (userId) => {
  const res = {
    type: "finish",
    data: {
      winPlayer: userId,
    },
    id: 0,
  };

  res.data = JSON.stringify(res.data).toString();
  return JSON.stringify(res);
};

export const exitingGame = async (userId) => {
  const gamesJson = await Game.getAllcolection();
  const games = JSON.parse(gamesJson);
  const game = games.filter(
    ({ player_1, player_2 }) => player_1 === userId || player_2 === userId
  );
  console.log(game);
  console.log(userId);
  if (game.length === 1) {
    if (game[0].player_1 === userId) {
      if (game[0].player_2 !== "Bot") {
        const res = getFinishResponse(game[0].player_2);
        usersOnBoard[game[0].player_2].send(res);
        usersOnBoard[game[0].player_1].send(res);
        console.log(game[0].player_2, res);
      }
    } else {
      const res = getFinishResponse(game[0].player_1);
      usersOnBoard[game[0].player_2].send(res);
      usersOnBoard[game[0].player_1].send(res);
      console.log(game[0].player_2, res);
    }

    await Game.deleteElement(game[0]._id);
    await Room.deleteElement(game[0]._id);
  }
};
