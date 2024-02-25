import { Game, Room, User } from "../main.js";
import { checkHits } from "../utils/check-hits.js";
import { killedShip } from "../utils/killed-ship.js";
import { turn } from "./game.js";
import { fightingSingle } from "./single-play.js";

export const getWinner = async (id) => {
  const gameJson = await Game.getElemnt(id);
  const game = JSON.parse(gameJson);
  let destroyedShips_1 = 0;
  let destroyedShips_2 = 0;

  game.shipsPlayer_1.forEach(({ alive }) => {
    if (!alive) {
      destroyedShips_1++;
    }
  });

  game.shipsPlayer_2.forEach(({ alive }) => {
    if (!alive) {
      destroyedShips_2++;
    }
  });

  if (destroyedShips_1 === 10) {
    return {
      winner: game.player_2,
      isVictory: true,
    };
  }

  if (destroyedShips_2 === 10) {
    return {
      winner: game.player_1,
      isVictory: true,
    };
  }

  return {
    winner: null,
    isVictory: false,
  };
};

export const fighting = async (rowData) => {
  const preparedData = { ...rowData };
  preparedData.data = JSON.parse(preparedData.data);

  if (preparedData.type === "randomAttack") {
    preparedData.data.x = Math.floor(Math.random() * 10);
    preparedData.data.y = Math.floor(Math.random() * 10);
  }
  const attack = preparedData.data;
  const gameJson = await Game.getElemnt(attack.gameId);
  const game = JSON.parse(gameJson);

  if (game.type === "single") {
    const { res, players, turnData, finish } = await fightingSingle(
      attack,
      game
    );
    return { res, players, turnData, finish };
  }

  let status = "miss";
  let currentPlayer = null;
  let ship = null;

  if (attack.indexPlayer === game.player_1) {
    const { result, shipWithDemage } = checkHits(game.shipsPlayer_2, attack);
    status = result;
    ship = shipWithDemage;
    currentPlayer = game.player_1;
    await Game.updateElement(game._id, game);
  } else {
    const { result, shipWithDemage } = checkHits(game.shipsPlayer_1, attack);
    status = result;
    ship = shipWithDemage;
    currentPlayer = game.player_2;
    await Game.updateElement(game._id, game);
  }

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
    turnData = await turn(rowData);
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

    const userJson = await User.getElemnt(winner);
    const user = JSON.parse(userJson);
    user.data.wins++;
    await User.updateElement(winner, user);
    await Game.deleteElement(game._id);
    await Room.deleteElement(game._id);
  }

  return {
    res,
    players: [game.player_1, game.player_2],
    turnData,
    finish,
  };
};
