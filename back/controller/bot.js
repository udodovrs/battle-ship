import { usersOnBoard } from "../../index.js";
import { Game } from "../main.js";
import { botHitShip, getBotAttack } from "../utils/bot-hit-ship.js";
import { checkHits } from "../utils/check-hits.js";
import { killedShip } from "../utils/killed-ship.js";

export const bot = async (game) => {
  const attack = await getBotAttack(game);
  const { result, shipWithDemage } = checkHits(game.shipsPlayer_1, attack);

  const res = {
    type: "attack",
    data: {
      position: {
        x: attack.x,
        y: attack.y,
      },
      currentPlayer: game.player_2,
      status: result,
    },
    id: 0,
  };

  const turn = {
    type: "turn",
    data: {
      currentPlayer: game.player_1,
    },
    id: 0,
  };

  if (result === "miss") {
    res.data = JSON.stringify(res.data).toString();
    usersOnBoard[game.player_1].send(JSON.stringify(res));
    game.turn = "player_1";

    turn.data = JSON.stringify(turn.data).toString();
    usersOnBoard[game.player_1].send(JSON.stringify(turn));
    console.log(game.player_1, res);
    console.log(game.player_1, turn);
  }

  if (result === "shot") {
    res.data = JSON.stringify(res.data).toString();
    usersOnBoard[game.player_1].send(JSON.stringify(res));
    console.log(game.player_1, res);

    await botHitShip(game, turn);
  }

  if (result === "killed") {
    const res = killedShip(shipWithDemage, game.player_1);
    usersOnBoard[game.player_1].send(JSON.stringify(res));
    res.forEach((item) => {
      usersOnBoard[game.player_1].send(JSON.stringify(item));
    });

    await botHitShip(game, turn);
  }

  await Game.updateElement(game._id, game);
};
