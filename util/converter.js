let user = {};
const convertJson = (result) => {
  user.firstName = result.firstName;
  user.lastName = result.lastName;
  user.address = result.address;
  user.city = result.city;
  user.state = result.state;
  user.zip = result.zip;
  user.email = result.email;
  return user;
};

module.exports = convertJson;
