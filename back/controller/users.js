import { User } from "../main.js";

export const regAndAythUser = async (newUser) => {
  newUser.data = JSON.parse(newUser.data, null, 2);
  const users = await User.getAllcolection();
  const user = JSON.parse(users).filter(
    (item) => item.data.name === newUser.data.name
  );

  if (user.length === 0) {
    const preparedUser = { ...newUser, data: { ...newUser.data, wins: 0 } };
    const userJson = await User.create(preparedUser);
    newUser.data.error = false;
    newUser.data.errorText = "";
    newUser.data.index = JSON.parse(userJson)._id;

    delete newUser.data.password;
    newUser.data = JSON.stringify(newUser.data).toString();

    return { user: JSON.stringify(newUser), _id: JSON.parse(userJson)._id };
  } else {
    if (user[0].data.password === newUser.data.password) {
      newUser.data.error = false;
      newUser.data.errorText = "";
      newUser.data.index = user[0]._id;
      delete newUser.data.password;
      newUser.data = JSON.stringify(newUser.data).toString();

      return { user: JSON.stringify(newUser), _id: user[0]._id };
    } else {
      newUser.data.error = true;
      newUser.data.errorText = "Passwords mismatch";
      newUser.data.index = user[0]._id;
      delete newUser.data.password;
      newUser.data = JSON.stringify(newUser.data).toString();

      return { user: JSON.stringify(newUser), _id: user[0]._id };
    }
  }
};

export const updateWinners = async () => {
  const users = await User.getAllcolection();
  const winners = JSON.parse(users).map((item) => ({
    name: item.data.name,
    wins: item.data.wins,
  }));

  const response = {
    type: "update_winners",
    data: winners,
    id: 0,
  };

  response.data = JSON.stringify(response.data).toString();
  return JSON.stringify(response);
};
