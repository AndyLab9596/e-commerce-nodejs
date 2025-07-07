"use-strict";

const AccessService = require("../services/access.service");
const { Created } = require("../core/success.response");

class AccessController {
  signUp = async (req, res, next) => {
    new Created({
      message: "Registered OK!",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };
}

module.exports = new AccessController();
