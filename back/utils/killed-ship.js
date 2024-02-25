export const killedShip = (ship, currentPlayer) => {
  const result = [];

  if (ship.direction) {
    for (let i = 0; i < ship.length + 2; i++) {
      if (ship.position.y - 1 + i >= 0 || ship.position.y - 1 + i <= 9) {
        result.push({
          position: { x: ship.position.x - 1, y: ship.position.y - 1 + i },
          currentPlayer,
          status: "miss",
        });
        result.push({
          position: { x: ship.position.x + 1, y: ship.position.y - 1 + i },
          currentPlayer,
          status: "miss",
        });
      }
    }
    if (ship.position.y - 1 >= 0) {
      result.push({
        position: { x: ship.position.x, y: ship.position.y - 1 },
        currentPlayer,
        status: "miss",
      });
    }
    if (ship.position.y + 1 <= 9) {
      result.push({
        position: { x: ship.position.x, y: ship.position.y + ship.length },
        currentPlayer,
        status: "miss",
      });
    }
  } else {
    for (let i = 0; i < ship.length + 2; i++) {
      if (ship.position.x - 1 + i >= 0 || ship.position.x - 1 + i <= 9) {
        result.push({
          position: { x: ship.position.x - 1 + i, y: ship.position.y - 1 },
          currentPlayer,
          status: "miss",
        });

        result.push({
          position: { x: ship.position.x - 1 + i, y: ship.position.y + 1 },
          currentPlayer,
          status: "miss",
        });
      }
    }
    if (ship.position.x - 1 >= 0) {
      result.push({
        position: { x: ship.position.x - 1, y: ship.position.y },
        currentPlayer,
        status: "miss",
      });
    }
    if (ship.position.x + 1 <= 9) {
      result.push({
        position: { x: ship.position.x + ship.length, y: ship.position.y },
        currentPlayer,
        status: "miss",
      });
    }
  }

  if (ship.length > 1) {
    for (let i = 0; i < ship.length; i++) {
      if (ship.direction) {
        result.push({
          position: { x: ship.position.x, y: ship.position.y + i },
          currentPlayer,
          status: "killed",
        });
      } else {
        result.push({
          position: { x: ship.position.x + i, y: ship.position.y },
          currentPlayer,
          status: "killed",
        });
      }
    }
  }

  const arr = result
    .map((item) => {
      return {
        type: "attack",
        data: JSON.stringify(item).toString(),
        id: 0,
      };
    })
    .map((item) => JSON.stringify(item));

  return arr;
};
