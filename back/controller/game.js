import { Room, Game } from "../main.js";
import { startSinglePlay } from "./single-play.js";

export const createGame = async (senderId, rowData) => {
  const preparedData = { ...rowData };
  preparedData.data = JSON.parse(preparedData.data);
  const roomJson = await Room.getElemnt(preparedData.data.indexRoom);

  const room = JSON.parse(roomJson);
  const { roomUsers, _id } = room;

  let player_1 = null;
  let player_2 = null;

  const gameRequest_1 = {
    type: "create_game",
    data: {
      idGame: null,
      idPlayer: null,
    },
    id: 0,
  };
  const gameRequest_2 = {
    type: "create_game",
    data: {
      idGame: null,
      idPlayer: null,
    },
    id: 0,
  };

  if (senderId === roomUsers[0].index) {
    player_1 = roomUsers[0].index;
    player_2 = roomUsers[1].index;
    gameRequest_1.data.idPlayer = player_1;
    gameRequest_2.data.idPlayer = player_2;
  } else {
    player_1 = roomUsers[1].index;
    player_2 = roomUsers[0].index;
    gameRequest_1.data.idPlayer = player_1;
    gameRequest_2.data.idPlayer = player_2;
  }
  gameRequest_1.data.idGame = _id;
  gameRequest_2.data.idGame = _id;

  gameRequest_1.data = JSON.stringify(gameRequest_1.data).toString();
  gameRequest_2.data = JSON.stringify(gameRequest_2.data).toString();

  return {
    create_game: [JSON.stringify(gameRequest_1), JSON.stringify(gameRequest_2)],
    players: [player_1, player_2],
  };
};

export const startGame = async (rowData) => {
  const preparedData = { ...rowData };
  preparedData.data = JSON.parse(preparedData.data);
  const game = await Game.getElemnt(preparedData.data.gameId);

  if (!game) {
    const gameChema = {
      _id: preparedData.data.gameId,
      turn: "player_1",
      shipsPlayer_1: preparedData.data.ships,
      player_1: preparedData.data.indexPlayer,
    };

    gameChema.shipsPlayer_1.forEach((item) => {
      item.alive = true;
      item.hits = 0;
    });

    await Game.createWithId(preparedData.data.gameId, gameChema);
    return { start_game: null, players: null };
  } else {
    const gameObj = JSON.parse(game);

    if (gameObj.type === "single") {
      const { start_game, players } = await startSinglePlay(rowData);
      return { start_game, players };
    }

    gameObj.shipsPlayer_2 = preparedData.data.ships;
    gameObj.player_2 = preparedData.data.indexPlayer;
    gameObj.shipsPlayer_2.forEach((item) => {
      item.alive = true;
      item.hits = 0;
    });
    const readyGameJson = await Game.updateElement(gameObj._id, gameObj);
    const readyGameObj = JSON.parse(readyGameJson);

    const startGame_1 = {
      type: "start_game",
      data: {
        ships: readyGameObj.shipsPlayer_1,
        currentPlayerIndex: readyGameObj.player_1,
      },
      id: 0,
    };
    const player_1 = readyGameObj.player_1;

    const startGame_2 = {
      type: "start_game",
      data: {
        ships: readyGameObj.shipsPlayer_2,
        currentPlayerIndex: readyGameObj.player_2,
      },
      id: 0,
    };
    const player_2 = readyGameObj.player_2;

    startGame_1.data = JSON.stringify(startGame_1.data).toString();
    startGame_2.data = JSON.stringify(startGame_2.data).toString();

    return {
      start_game: [JSON.stringify(startGame_1), JSON.stringify(startGame_2)],
      players: [player_1, player_2],
    };
  }
};

export const turn = async (rowData) => {
  const preparedData = { ...rowData };
  preparedData.data = JSON.parse(preparedData.data);
  const gameJson = await Game.getElemnt(preparedData.data.gameId);
  const game = JSON.parse(gameJson);
  let currentPlayer = null;

  if (gameJson) {
    if (game.turn === "player_1") {
      currentPlayer = game.player_1;
      game.turn = "player_2";
    } else {
      currentPlayer = game.player_2;
      game.turn = "player_1";
    }

    if (game.type === "single") {
      game.turn = "player_1";
      currentPlayer = game.player_1;
    }

    await Game.updateElement(game._id, game);
  }

  const dataTurn = {
    type: "turn",
    data: {
      currentPlayer,
    },
    id: 0,
  };

  dataTurn.data = JSON.stringify(dataTurn.data).toString();
  return JSON.stringify(dataTurn);
};

export const checkWhoturn = async (rowData) => {
  const preparedData = { ...rowData };
  preparedData.data = JSON.parse(preparedData.data);
  const gameJson = await Game.getElemnt(preparedData.data.gameId);
  const game = JSON.parse(gameJson);

  if (game.type === "single") {
    if (game.turn === "player_1") {
      return true;
    } else {
      return false;
    }
  }

  const playerWhoTurn = game.turn;
  if (game[playerWhoTurn] === preparedData.data.indexPlayer) {
    return false;
  } else {
    return true;
  }
};
