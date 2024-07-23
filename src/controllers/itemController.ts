import { RequestHandler } from "express";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import ItemModel from "../models/item";
import { assertIsDefined } from "../util/assertIsDefined";
import { decrypt, encrypt } from "../util/crypto";

export const getItems: RequestHandler = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;
  try {
    assertIsDefined(authenticatedUserId);
    const items = await ItemModel.find({
      userId: authenticatedUserId,
    }).exec();

    const decryptedItems = items.map((item) => ({
      ...item.toObject(),
      password: decrypt(item.password),
      username: decrypt(item.username),
    }));

    res.status(200).json(decryptedItems);
  } catch (error) {
    next(error);
  }
};

export const getItem: RequestHandler = async (req, res, next) => {
  const itemId = req.params.itemId;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(itemId))
      throw createHttpError(
        400,
        "Invalid request Id for your saved passwords!",
      );

    const itemResponse = await ItemModel.findById(itemId).exec();

    if (!itemResponse)
      throw createHttpError(
        404,
        "The saved passwords that you're searching it wasn't found",
      );
    if (!itemResponse.userId.equals(authenticatedUserId))
      throw createHttpError(401, "Ey, this item don't belong to you");

    const decryptedItem = {
      ...itemResponse.toObject(),
      password: decrypt(itemResponse.password),
      username: decrypt(itemResponse.username),
    };

    res.status(200).json(decryptedItem);
  } catch (error) {
    next(error);
  }
};

enum Category {
  Work = "Work",
  Personal = "Personal",
  Social = "Social",
  Banking = "Banking",
  Other = "Other",
  noCategory = "No category",
}

interface CreateItemBody {
  name?: string;
  username?: string;
  password?: string;
  category?: Category;
  url?: string;
  favorite?: string;
}

export const createItem: RequestHandler<
  unknown,
  unknown,
  CreateItemBody,
  unknown
> = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;

  const name = req.body.name;
  const password = req.body.password;
  const username = req.body.username;
  const category = req.body.category;
  const url = req.body.url;
  const favorite = req.body.favorite;

  try {
    assertIsDefined(authenticatedUserId);

    if (!name) throw createHttpError(400, "The name is required for the Item");
    if (!username) throw createHttpError(400, "The item must have a username");
    if (!password) throw createHttpError(400, "The item must have a password");

    const item = await ItemModel.create({
      userId: authenticatedUserId,
      name: name,
      password: encrypt(password),
      username: encrypt(username),
      category: category,
      url: url,
      favorite: favorite,
    });

    const decryptedItem = {
      ...item.toObject(),
      password: decrypt(item.password),
      username: decrypt(item.username),
    };

    res.status(201).json(decryptedItem);
  } catch (error) {
    next(error);
  }
};

interface updateItemId {
  itemId: string;
}
interface updatedItemBody {
  name?: string;
  username?: string;
  password?: string;
  category?: Category;
  url?: string;
  favorite?: string;
}

export const updatedItem: RequestHandler<
  updateItemId,
  unknown,
  updatedItemBody,
  unknown
> = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;

  const currentItemId = req.params.itemId;
  const newName = req.body.name;
  const newPassword = req.body.password;
  const newUsername = req.body.username;
  const newCategory = req.body.category;
  const newUrl = req.body.url;
  const favorite = req.body.favorite;

  try {
    assertIsDefined(authenticatedUserId);
    if (!mongoose.isValidObjectId(currentItemId))
      throw createHttpError(
        400,
        "Check out the ID of the item that you wanna edit",
      );

    if (!newName)
      throw createHttpError(400, "The name is required for the Item");
    if (!newUsername)
      throw createHttpError(400, "The item must have a username");
    if (!newPassword)
      throw createHttpError(400, "The item must have a password");
    const itemUpdateResponse = await ItemModel.findById(currentItemId).exec();

    if (!itemUpdateResponse) throw createHttpError(404, "Item not found");

    if (!itemUpdateResponse.userId.equals(authenticatedUserId))
      throw createHttpError(401, "You can't edit this item");

    itemUpdateResponse.userId = authenticatedUserId;
    itemUpdateResponse.name = newName;
    itemUpdateResponse.password = encrypt(newPassword);
    itemUpdateResponse.username = encrypt(newUsername);
    itemUpdateResponse.category = !newCategory
      ? Category.noCategory
      : newCategory;
    itemUpdateResponse.url = newUrl;
    itemUpdateResponse.favorite = !favorite ? false : true;

    const itemUpdated = await itemUpdateResponse.save();

    const decryptedItem = {
      ...itemUpdated.toObject(),
      password: decrypt(itemUpdated.password),
      username: decrypt(itemUpdated.username),
    };

    res.status(200).json(decryptedItem);
  } catch (error) {
    next(error);
  }
};

export const deleteItem: RequestHandler = async (req, res, next) => {
  const currentItemId = req.params.itemId;
  const authenticatedUserId = req.session.userId;
  try {
    assertIsDefined(authenticatedUserId);
    if (!mongoose.isValidObjectId(currentItemId))
      throw createHttpError(
        400,
        "Check out the ID of the item that you wanna Delete",
      );
    const itemResponse = await ItemModel.findById(currentItemId).exec();

    if (!itemResponse) throw createHttpError(404, "Item not found");

    if (!itemResponse.userId.equals(authenticatedUserId))
      throw createHttpError(401, "You can't delete this item.");
    await itemResponse.deleteOne();
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
