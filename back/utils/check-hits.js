export const checkHits = (ships, attack) => {
  let result = "miss";
  let shipWithDemage = null;
  ships.forEach((item) => {
    if (!item.alive) {
      return;
    }

    if (item.direction) {
      const hitCondition =
        attack.y >= item.position.y &&
        attack.y <= item.position.y + item.length - 1 &&
        attack.x === item.position.x;
      if (hitCondition) {
        item.hits = item.hits + 1;
        if (item.hits === item.length) {
          item.alive = false;
          result = "killed";
          shipWithDemage = item;
          return;
        } else {
          result = "shot";
          shipWithDemage = item;
          return;
        }
      }
    } else {
      const hitCondition =
        attack.x >= item.position.x &&
        attack.x <= item.position.x + item.length - 1 &&
        attack.y === item.position.y;
      if (hitCondition) {
        item.hits = item.hits + 1;
        if (item.hits === item.length) {
          item.alive = false;
          result = "killed";
          shipWithDemage = item;
          return;
        } else {
          result = "shot";
          shipWithDemage = item;
          return;
        }
      }
    }
  });
  return { result, shipWithDemage };
};
