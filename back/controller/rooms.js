import { Room, User } from "../main.js";

export const createRoom = async (userId) => {
  const userJson = await User.getElemnt(userId);
  const userObj = JSON.parse(userJson);

  const userData = {
    name: userObj.data.name,
    index: userObj._id,
  };

  const roomData = {
    roomUsers: [userData],
  };

  const room = await Room.create(roomData);
  return room;
};

export const getRoomsWithOnePlayer = async () => {
  const rooms = await Room.getAllcolection();
  const roomsWithOnePlayer = JSON.parse(rooms)
    .filter(({ roomUsers }) => roomUsers.length === 1)
    .map((item) => ({ roomId: item._id, roomUsers: item.roomUsers }));

  const response = {
    type: "update_room",
    data: roomsWithOnePlayer,
    id: 0,
  };
  response.data = JSON.stringify(response.data).toString();

  return JSON.stringify(response);
};

export const addUserToRoom = async (rowData, userId) => {
  const roomId = JSON.parse(rowData.data).indexRoom;
  const roomJSon = await Room.getElemnt(roomId);
  const room = JSON.parse(roomJSon);

  if (room.roomUsers[0].index === userId) {
    return false;
  }

  const userJson = await User.getElemnt(userId);
  const userObj = JSON.parse(userJson);

  room.roomUsers = [
    ...room.roomUsers,
    { name: userObj.data.name, index: userObj._id },
  ];
  const updateRoom = await Room.updateElement(roomId, room);

  const player_1 = room.roomUsers[0].name;
  const player_2 = room.roomUsers[1].name;
  const rooms = await Room.getAllcolection();

  JSON.parse(rooms)
    .filter(({ roomUsers }) => roomUsers.length === 1)
    .forEach(async ({ _id, roomUsers }) => {
      const nameUserWithRoom = roomUsers[0].name;
      const condition =
        nameUserWithRoom === player_1 || nameUserWithRoom === player_2;
      if (condition) {
        await Room.deleteElement(_id);
      }
    });

  return true;
};
