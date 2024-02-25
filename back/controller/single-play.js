import { Game, User } from "../main.js";
import { checkHits } from "../utils/check-hits.js";
import { killedShip } from "../utils/killed-ship.js";
import { shipsForBot } from "../utils/ships-for-bot.js";
import { bot } from "./bot.js";
import { getWinner } from "./fighting.js";

export const createSinglePlay = async (userId) => {
  const gameJson = await Game.create({ type: "single", botHits: [] });
  const game = JSON.parse(gameJson);

  const res = {
    type: "create_game",
    data: {
      idGame: game._id,
      idPlayer: userId,
    },
    id: 0,
  };

  res.data = JSON.stringify(res.data).toString();
  return JSON.stringify(res);
};

export const startSinglePlay = async (rowData) => {
  const preparedData = { ...rowData };
  preparedData.data = JSON.parse(preparedData.data);
  const gameJSon = await Game.getElemnt(preparedData.data.gameId);
  const game = JSON.parse(gameJSon);

  game.player_1 = preparedData.data.indexPlayer;
  game.player_2 = "Bot";

  preparedData.data.ships.forEach((item) => {
    item.alive = true;
    item.hits = 0;
  });
  game.shipsPlayer_1 = preparedData.data.ships;
  game.shipsPlayer_2 =
    shipsForBot[Math.floor(Math.random() * shipsForBot.length)];

  game.turn = "player_1";
  await Game.updateElement(game._id, game);

  const startGame = {
    type: "start_game",
    data: {
      ships: game.shipsPlayer_1,
      currentPlayerIndex: game.player_1,
    },
    id: 0,
  };
  startGame.data = JSON.stringify(startGame.data).toString();

  return {
    start_game: [JSON.stringify(startGame)],
    players: [game.player_1],
  };
};

export const fightingSingle = async (attack, game) => {
  let status = "miss";
  let currentPlayer = null;
  let ship = null;

  const { result, shipWithDemage } = checkHits(game.shipsPlayer_2, attack);
  status = result;
  ship = shipWithDemage;
  currentPlayer = game.player_1;
  await Game.updateElement(game._id, game);

  const response = {
    type: "attack",
    data: {
      position: {
        x: attack.x,
        y: attack.y,
      },
      currentPlayer,
      status,
    },
    id: 0,
  };
  response.data = JSON.stringify(response.data).toString();

  let res = [];
  res.push(JSON.stringify(response));
  if (status === "killed") {
    res = [...res, ...killedShip(ship, currentPlayer)];
  }

  let turnData = null;
  if (status === "miss") {
    turnData = {
      type: "turn",
      data: {
        currentPlayer: "Bot",
      },
      id: 0,
    };
    game.turn = "Bot";

    turnData.data = JSON.stringify(turnData.data).toString();
    await Game.updateElement(game._id, game);
    setTimeout(async () => await bot(game), 500);
  }

  let finish = null;
  const { winner, isVictory } = await getWinner(game._id);
  if (isVictory) {
    const rowFinish = {
      type: "finish",
      data: {
        winPlayer: winner,
      },
      id: 0,
    };
    rowFinish.data = JSON.stringify(rowFinish.data).toString();
    finish = JSON.stringify(rowFinish);
    if (winner === "Bot") {
    } else {
      const userJson = await User.getElemnt(winner);
      const user = JSON.parse(userJson);
      user.data.wins++;
      await User.updateElement(winner, user);
      await Game.deleteElement(game._id);
    }
  }

  return {
    res,
    players: [game.player_1],
    turnData: JSON.stringify(turnData),
    finish,
  };
};
