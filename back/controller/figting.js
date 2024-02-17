import { Game } from "../main.js";

const checkHits = (ships, attack, status) => {
  ships.forEach((item) => {
    if (!item.alive) {
      return;
    }

    if (item.direction) {
      const hitCondition =
        attack.y > item.position.y &&
        attack.y <= item.position.y + item.length &&
        attack.x === item.position.x + 1;
      if (hitCondition) {
        item.hits += 1;
        if (item.hits === item.length) {
          item.alive = false;
          status = "killed";
          return;
        } else {
          status = "shot";
          return;
        }
      }
    } else {
      const hitCondition =
        attack.x > item.position.x &&
        attack.x <= item.position.x + item.length &&
        attack.y === item.position.y + 1;
      if (hitCondition) {
        item.hits += 1;
        if (item.hits === item.length) {
          item.alive = false;
          status = "killed";
          return;
        } else {
          status = "shot";
          return;
        }
      }
    }
  });
};

export const fighting = async (rowData) => {
  const preparedData = { ...rowData };
  preparedData.data = JSON.parse(preparedData.data);
  const attack = preparedData.data;
  const gameJson = await Game.getElemnt(attack.gameId);
  const game = JSON.parse(gameJson);

  let status = "miss";
  let currentPlayer = null;

  if (attack.indexPlayer === game.player_1) {
    checkHits(game.shipsPlayer_2, attack, status);
    currentPlayer = game.player_1;
  } else {
    checkHits(game.shipsPlayer_1, attack, status);
    currentPlayer = game.player_2;
  }

  status = "killed";
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

  console.log(response);

  response.data = JSON.stringify(response.data).toString();
  return { res: JSON.stringify(response), player: currentPlayer };
};


