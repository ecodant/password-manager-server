import bcrypt from "bcrypt";
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user";
import { assertIsDefined } from "../util/assertIsDefined";
import multer from "multer";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.session.userId)
      .select("+email")
      .exec();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

interface SignUpBody {
  name?: string;
  email?: string;
  password?: string;
}

export const signUp: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const passwordRaw = req.body.password;

  try {
    if (!name || !email || !passwordRaw) {
      throw createHttpError(400, "Parameters missing");
    }

    const existingEmail = await UserModel.findOne({ email: email }).exec();

    if (existingEmail) {
      throw createHttpError(
        409,
        "A user with this email address already exists. Please use one different.",
      );
    }

    const passwordHashed = await bcrypt.hash(passwordRaw, 11);

    const newUser = await UserModel.create({
      name: name,
      email: email,
      password: passwordHashed,
    });

    // req.session.userId = newUser._id; //Creates my cookie session when the user sign UP, which I don't like

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

interface LoginBody {
  password?: string;
  email?: string;
}
export const login: RequestHandler<
  unknown,
  unknown,
  LoginBody,
  unknown
> = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    if (!email || !password) {
      throw createHttpError(400, "Parameters missing");
    }

    const user = await UserModel.findOne({ email: email })
      .select("+password +email")
      .exec();

    if (!user) {
      throw createHttpError(401, "Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw createHttpError(401, "Invalid credentials");
    }

    req.session.userId = user._id;
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};
export const updatePassword: RequestHandler = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  try {
    if (!authenticatedUserId) throw new Error("Your are not authenticated");
    const user = await UserModel.findById(authenticatedUserId);
    if (!user) throw new Error("User not found");
    if (!currentPassword || !newPassword || !confirmNewPassword)
      throw new Error("Some fields missed");

    const currentPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!currentPasswordMatch)
      throw new Error("The current Password provided is not right");
    user.password = await bcrypt.hash(newPassword, 11);

    await user.save();

    req.session.destroy((error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(200);
      }
    });
  } catch (error) {
    next(error);
  }
};
const upload = multer({ storage: multer.memoryStorage() });

export const updateUser: RequestHandler = async (req, res, next) => {
  upload.single("profileImg")(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    const authenticatedUserId = req.session.userId;
    const { name, email } = req.body;

    try {
      if (!authenticatedUserId) throw new Error("User not authenticated");

      const user = await UserModel.findById(authenticatedUserId);
      if (!user) throw new Error("User not found");

      if (name) {
        user.name = name;
      }

      if (email) {
        const existingEmail = await UserModel.findOne({ email: email }).exec();

        if (existingEmail) {
          throw createHttpError(
            409,
            "The the provided mail its already used, so use a different one.",
          );
        }

        user.email = email;
      }
      if (req.file) {
        user.profileImg = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      } else {
        user.profileImg = undefined;
      }

      const updatedUser = await user.save();
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  });
};

export const getProfileImg: RequestHandler = async (req, res) => {
  const authenticatedUserId = req.session.userId;
  try {
    if (!authenticatedUserId) {
      throw new Error("User not authenticated");
    }

    const user = await UserModel.findById(authenticatedUserId);
    if (!user || !user.profileImg) {
      return res.status(404).send("Image not found");
    }

    if (!user.profileImg.contentType) {
      res.contentType("image/png");
    } else {
      res.contentType(user.profileImg.contentType);
    }
    res.send(user.profileImg.data);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

export const logout: RequestHandler = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(200);
    }
  });
};
