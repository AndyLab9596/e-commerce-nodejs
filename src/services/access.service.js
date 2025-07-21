"use-strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITE: "WRITER", // 00001
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /**
   * 1. check email in dbs
   * 2. match password
   * 3. create AT vs RT and Save
   * 4. generate tokens
   * 5. get data returns login
   */

  static handleRefreshToken = async (refreshToken) => {
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    if (foundToken) {
      // decode to check who is the user
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("something went wrong");
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("shop not registered");
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    const foundUser = await findByEmail({ email });
    if (!foundUser) throw new AuthFailureError("shop not registered");

    const tokens = await AccessService.createTokens({
      userId: foundUser._id,
      email: foundUser.email,
      privateKey: holderToken.privateKey,
      publicKey: holderToken.publicKey,
    });

    await holderToken.updateOne(
      {
        $set: { refreshToken: tokens.refreshToken },
        $addToSet: { refreshTokensUsed: refreshToken },
      },
      {
        collation: { locale: "en", strength: 2 }, // 👈 đúng vị trí
      }
    );

    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");

    const tokens = await AccessService.createTokens({
      userId: foundShop._id,
      email: foundShop.email,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

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

      // const publicKey = crypto.randomBytes(64).toString("hex");
      // const privateKey = crypto.randomBytes(64).toString("hex");

      // const keyStore = await KeyTokenService.createKeyToken({
      //   userId: newShop._id,
      //   publicKey,
      //   privateKey,
      // });

      // if (!keyStore) {
      //   throw new BadRequestError("Error: keyStore error");
      // }

      // // const tokens pair
      // const tokens = await createTokenPair(
      //   { userId: newShop._id, email },
      //   publicKey,
      //   privateKey
      // );

      const tokens = await AccessService.createTokens({
        userId: newShop._id,
        email: newShop.email,
      });

      return {
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
      metadata: null,
    };
  };

  static async createTokens({
    userId,
    email,
    publicKey = null,
    privateKey = null,
  }) {
    const pk = publicKey || crypto.randomBytes(64).toString("hex");
    const prK = privateKey || crypto.randomBytes(64).toString("hex");

    const tokens = await createTokenPair({ userId, email }, pk, prK);

    const keyStore = await KeyTokenService.createKeyToken({
      userId,
      publicKey: pk,
      privateKey: prK,
      refreshToken: tokens.refreshToken,
    });

    if (!keyStore) {
      throw new BadRequestError("Error: keyStore error");
    }

    return tokens;
  }
}

module.exports = AccessService;
