import { usersOnBoard } from "../../index.js";
import { Game } from "../main.js";
import { checkHits } from "./check-hits.js";
import { killedShip } from "./killed-ship.js";

export const getBotAttack = async (game) => {
  while (true) {
    const attack = {
      x: Math.floor(Math.random() * 10),
      y: Math.floor(Math.random() * 10),
    };
    const shots = game.botHits.filter(
      ({ x, y }) => x === attack.x && y === attack.y
    );  
    if (shots.length === 0) {
      game.botHits.push(attack);
      await Game.updateElement(game._id, game);
      return attack;
    }
  }
};

export const botHitShip = async (game, turn) => {
  const botAttack = await getBotAttack(game);
  const { result, shipWithDemage } = checkHits(game.shipsPlayer_1, botAttack);
  const res = {
    type: "attack",
    data: {
      position: {
        x: botAttack.x,
        y: botAttack.y,
      },
      currentPlayer: game.player_2,
      status: result,
    },
    id: 0,
  };
  if (result === "shot") {
    res.data = JSON.stringify(res.data).toString();
    usersOnBoard[game.player_1].send(JSON.stringify(res));
    console.log(game.player_1, res);
    botHitShip(game, turn);
  }
  if (result === "miss") {
    res.data = JSON.stringify(res.data).toString();
    usersOnBoard[game.player_1].send(JSON.stringify(res));
    game.turn = "player_1";

    turn.data = JSON.stringify(turn.data).toString();
    usersOnBoard[game.player_1].send(JSON.stringify(turn));
    console.log(game.player_1, res);
    console.log(game.player_1, turn);
  }
  if (result === "killed") {
    const res = killedShip(shipWithDemage, game.player_1);
    usersOnBoard[game.player_1].send(JSON.stringify(res));
    res.forEach((item) => {
      usersOnBoard[game.player_1].send(JSON.stringify(item));
    });
    botHitShip(game, turn);
  }
  await Game.updateElement(game._id, game);
};
