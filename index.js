import { httpServer } from "./src/http_server/index.js";
import { WebSocketServer } from "ws";
import { main } from "./back/main.js";

const HTTP_PORT = 8181;
const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: WS_PORT });

const usersOnBoard = {};

wss.on("connection", (ws) => {
  console.log("new conection");
  let userId = null;

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
      res_all.forEach((item) => {
        ws.send(item);
      });
    }

    if (preparedData.type === "create_room") {
      res_all.forEach((item) => {
        ws.send(item);
      });
    }

    if (preparedData.type === "add_user_to_room") {
      payload.forEach((item, index) => {
        usersOnBoard[item].send(res_gameRoom[index]);
      });
      res_all.forEach((item) => {
        ws.send(item);
      });
    }

    if (preparedData.type === "add_ships") {
      if (payload && res_gameRoom) {
        payload.forEach((item, index) => {
          usersOnBoard[item].send(res_gameRoom.start_game[index]);
          usersOnBoard[item].send(res_gameRoom.turnData);
        });
       
      }
    }

    if (preparedData.type === "attack") {
      usersOnBoard[payload].send(res_gameRoom);
    }
  });

  /*  ws.on("close", () => {
    delete usersOnBoard[userName];
  }); */
});
