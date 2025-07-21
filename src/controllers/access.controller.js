"use-strict";

const AccessService = require("../services/access.service");
const { Created, SuccessResponse } = require("../core/success.response");

class AccessController {
  handleRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Get token success",
      metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      message: "Log in OK",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    new Created({
      message: "Registered OK!",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Log out OK",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };
}

module.exports = new AccessController();
