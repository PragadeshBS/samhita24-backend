const WebAction = require("../models/webActionModel");
const axios = require("axios");

const saveWebAction = async (clientIp, path, user, ua, message) => {
  if (clientIp) {
    axios.get(`http://ip-api.com/json/${clientIp}`).then(async (response) => {
      await WebAction.create({
        ua,
        path,
        user: user?._id,
        ...response.data,
        message,
      });
    });
  }
  console.log(
    clientIp,
    ua,
    user?._id,
    user?.userName,
    user?.email,
    "from save web action"
  );
};

module.exports = saveWebAction;
