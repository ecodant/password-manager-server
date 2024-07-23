import { RequestHandler } from "express";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import { assertIsDefined } from "../util/assertIsDefined";
import { Months, Years, Brands } from "../models/card";
import cardModel from "../models/card";
import { decrypt, encrypt } from "../util/crypto";

export const getCards: RequestHandler = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;
  try {
    assertIsDefined(authenticatedUserId);
    const cards = await cardModel
      .find({
        userId: authenticatedUserId,
      })
      .exec();

    const decryptedCards = cards.map((card) => {
      const cardObject = card.toObject();
      return {
        ...cardObject,
        cardHolderName: decrypt(cardObject.cardHolderName),
        cardNumber: decrypt(cardObject.cardNumber),
        expiredMonth: decrypt(cardObject.expiredMonth),
        expiredYear: decrypt(cardObject.expiredYear),
        cardCode: decrypt(cardObject.cardCode),
      };
    });

    res.status(200).json(decryptedCards);
  } catch (error) {
    next(error);
  }
};

export const getCard: RequestHandler = async (req, res, next) => {
  const cardId = req.params.cardId;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(cardId))
      throw createHttpError(400, "Invalid card Id");

    const cardResponse = await cardModel.findById(cardId).exec();

    if (!cardResponse)
      throw createHttpError(
        404,
        "The saved passwords that you're searching it wasn't found",
      );
    if (!cardResponse.userId.equals(authenticatedUserId))
      throw createHttpError(401, "Ey, this item don't belong to you");

    const decryptedCard = {
      ...cardResponse.toObject(),
      cardHolderName: decrypt(cardResponse.cardHolderName),
      cardNumber: decrypt(cardResponse.cardNumber),
      expiredMonth: decrypt(cardResponse.expiredMonth),
      expiredYear: decrypt(cardResponse.expiredYear),
      cardCode: decrypt(cardResponse.cardCode),
    };

    res.status(200).json(decryptedCard);
  } catch (error) {
    next(error);
  }
};

interface createCardBody {
  name?: string;
  cardHolderName?: string;
  cardNumber?: string;
  expiredMonth?: Months;
  expiredYear?: Years;
  cardCode?: string;
  brand?: Brands;
  favorite?: string;
}
export const createCard: RequestHandler<
  unknown,
  unknown,
  createCardBody,
  unknown
> = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;

  const {
    name,
    cardHolderName,
    cardNumber,
    expiredMonth,
    expiredYear,
    cardCode,
    brand,
    favorite,
  } = req.body;

  try {
    assertIsDefined(authenticatedUserId);

    if (!name) throw createHttpError(400, "The name is required for the Card");
    if (!cardHolderName)
      throw createHttpError(400, "Card holder name is required");
    if (!cardNumber) throw createHttpError(400, "Card number is required");
    if (!expiredYear) throw createHttpError(400, "Expired year is required");
    if (!expiredMonth) throw createHttpError(400, "Expired month is required");
    if (!cardCode) throw createHttpError(400, "The card code is required");

    const card = await cardModel.create({
      userId: authenticatedUserId,
      name,
      cardHolderName: encrypt(cardHolderName),
      cardNumber: encrypt(cardNumber),
      expiredYear: encrypt(expiredYear),
      expiredMonth: encrypt(expiredMonth),
      cardCode: encrypt(cardCode),
      brand: brand as Brands,
      favorite,
    });

    const decryptedCard = {
      ...card.toObject(),
      cardHolderName: decrypt(card.cardHolderName),
      cardNumber: decrypt(card.cardNumber),
      expiredMonth: decrypt(card.expiredMonth),
      expiredYear: decrypt(card.expiredYear),
      cardCode: decrypt(card.cardCode),
    };

    res.status(201).json(decryptedCard);
  } catch (error) {
    next(error);
  }
};
interface updateCardParams {
  cardId: string;
}
interface updateCardBody {
  name?: string;
  cardHolderName?: string;
  cardNumber?: string;
  cardCode?: string;
  expiredMonth?: Months;
  expiredYear?: Years;
  brand?: Brands;
  favorite?: boolean;
}

export const updateCard: RequestHandler<
  updateCardParams,
  unknown,
  updateCardBody,
  unknown
> = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;

  const cardId = req.params.cardId;
  const {
    name,
    cardHolderName,
    cardNumber,
    expiredMonth,
    expiredYear,
    cardCode,
    brand,
    favorite,
  } = req.body;

  try {
    assertIsDefined(authenticatedUserId);
    if (!mongoose.isValidObjectId(cardId))
      throw createHttpError(400, "Invalid card Id");

    const cardResponse = await cardModel.findById(cardId).exec();

    if (!cardResponse) throw createHttpError(404, "Card not found");
    if (!cardResponse.userId.equals(authenticatedUserId))
      throw createHttpError(401, "You can't edit this card");

    if (!name) throw createHttpError(400, "The name is required for the Card");
    if (!cardHolderName)
      throw createHttpError(400, "The card holder name is required");
    if (!cardNumber) throw createHttpError(400, "The card number is required");
    if (!expiredMonth)
      throw createHttpError(400, "The expired month is required");
    if (!expiredYear)
      throw createHttpError(400, "The expired year is required");
    if (!cardCode) throw createHttpError(400, "The card code is required");

    cardResponse.name = name;
    cardResponse.cardHolderName = encrypt(cardHolderName);
    cardResponse.cardNumber = encrypt(cardNumber);
    cardResponse.expiredMonth = encrypt(expiredMonth);
    cardResponse.expiredYear = encrypt(expiredYear);
    cardResponse.cardCode = encrypt(cardCode);
    cardResponse.brand = brand as Brands;
    cardResponse.favorite = favorite ?? cardResponse.favorite;

    const updatedCard = await cardResponse.save();

    const decryptedCard = {
      ...updatedCard.toObject(),
      cardHolderName: decrypt(updatedCard.cardHolderName),
      cardNumber: decrypt(updatedCard.cardNumber),
      expiredMonth: decrypt(updatedCard.expiredMonth),
      expiredYear: decrypt(updatedCard.expiredYear),
      cardCode: decrypt(updatedCard.cardCode),
    };
    res.status(200).json(decryptedCard);
  } catch (error) {
    next(error);
  }
};

export const deleteCard: RequestHandler = async (req, res, next) => {
  const cardId = req.params.cardId;
  const authenticatedUserId = req.session.userId;

  try {
    assertIsDefined(authenticatedUserId);
    if (!mongoose.isValidObjectId(cardId))
      throw createHttpError(400, "Invalid card Id");

    const cardResponse = await cardModel.findById(cardId).exec();

    if (!cardResponse) throw createHttpError(404, "Card not found");
    if (!cardResponse.userId.equals(authenticatedUserId))
      throw createHttpError(401, "You can't delete this card");

    await cardResponse.deleteOne();
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
