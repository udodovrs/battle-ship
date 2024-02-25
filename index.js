import { httpServer } from "./src/http_server/index.js";
import { WebSocketServer } from "ws";
import { main } from "./back/main.js";
import { exitingGame } from "./back/controller/exiting-game.js";

const HTTP_PORT = 8181;
const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: WS_PORT });

export const usersOnBoard = {};
let userId = null;

wss.on("connection", (ws) => {
  console.log("new conection");

  ws.on("message", async (data) => {
    const preparedData = JSON.parse(data.toString());
    const { res_person, res_all, res_gameRoom, payload } = await main(
      preparedData,
      userId
    );

    if (preparedData.type === "reg") {
      userId = payload;
      usersOnBoard[userId] = ws;
      usersOnBoard[userId].send(res_person);
      console.log(res_person);
      res_all.forEach((item) => {
        ws.send(item);
        console.log(item);
      });
    }

    if (preparedData.type === "create_room") {
      res_all.forEach((item) => {
        ws.send(item);
        console.log(item);
      });
    }

    if (preparedData.type === "add_user_to_room") {
      if (payload.isAdduser) {
        payload.players.forEach((item, index) => {
          usersOnBoard[item].send(res_gameRoom[index]);
          console.log(item, res_gameRoom[index]);
        });
        res_all.forEach((item) => {
          ws.send(item);
          console.log(item);
        });
      }
    }

    if (preparedData.type === "add_ships") {
      if (payload && res_gameRoom) {
        payload.forEach((item, index) => {
          usersOnBoard[item].send(res_gameRoom.start_game[index]);
          usersOnBoard[item].send(res_gameRoom.turnData);

          console.log(item, res_gameRoom.start_game[index]);
          console.log(item, res_gameRoom.turnData);
        });
      }
    }

    if (
      preparedData.type === "attack" ||
      preparedData.type === "randomAttack"
    ) {
      if (payload) {
        res_gameRoom.res.forEach((item) => {
          usersOnBoard[payload[0]].send(item);
          console.log("player: ", payload[0], item);

          if (payload.length === 2) {
            usersOnBoard[payload[1]].send(item);
            console.log("player: ", payload[1], item);
          }
        });

        if (res_gameRoom.turnData) {
          payload.forEach((item) => {
            usersOnBoard[item].send(res_gameRoom.turnData);
            console.log("player: ", item, res_gameRoom.turnData);
          });
        }

        if (res_gameRoom.finish) {
          payload.forEach((item) => {
            usersOnBoard[item].send(res_gameRoom.finish);
            usersOnBoard[item].send(res_all.rooms);
            usersOnBoard[item].send(res_all.wins);
            console.log("player: ", item, res_gameRoom.finish);
            console.log("player: ", item, res_all.rooms);
            console.log("player: ", item, res_all.wins);
          });
        }
      }
    }

    if (preparedData.type === "single_play") {
      usersOnBoard[userId].send(res_person);
    }
  });

  ws.on("close", async () => {
    await exitingGame(userId);
  });
});
