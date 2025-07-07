"use-strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
} = require("../core/error.response");

const RoleShop = {
  SHOP: "SHOP",
  WRITE: "WRITER", // 00001
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    // step 1: check email exists
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registerd");
    }

    const passwordHashed = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHashed,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      /**
       * create privateKey, publicKey
       * privateKey is used for signin' token
       * publicKey is used for verifyin' token
       */
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });
      const publicKey = crypto.randomBytes(64).toString("hex");
      const privateKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: keyStore error");
      }

      // const tokens pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
