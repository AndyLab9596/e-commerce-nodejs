"use strict";

const { Types, default: mongoose } = require("mongoose");
const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken,
      };
      const options = {
        upsert: true,
        new: true,
      };

      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keytokenModel
      .findOne({
        user: new mongoose.Types.ObjectId(userId),
      })
      .collation({ locale: "en", strength: 2 })
      .lean();
  };

  static removeKeyById = async (id) => {
    return await keytokenModel.findByIdAndDelete(id);
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .collation({ locale: "en", strength: 2 });
  };

  static deleteKeyById = async (userId) => {
    return await keytokenModel.findByIdAndDelete({ user: userId });
  };

  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel
      .findOne({ refreshToken })
      .collation({ locale: "en", strength: 2 });
  };
}

module.exports = KeyTokenService;
