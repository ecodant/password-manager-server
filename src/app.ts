import MongoStore from "connect-mongo";
import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import createHttpError, { isHttpError } from "http-errors";
import env from "./util/envValidation";
import usersRoute from "../src/routes/user";
import itemsRoute from "./routes/item";
import cardRoute from "./routes/card";
import morgan from "morgan";
import cors from "cors";
const app = express();

app.use(morgan("dev"));

app.use(express.json());

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    //The time that takes for the cookie expired, it's in miliseconds
    cookie: {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
    rolling: true,
    store: MongoStore.create({
      mongoUrl: env.MONGO_CONNECTION_STRING,
    }),
  }),
);

app.use("/api/users", usersRoute);
app.use("/api/items", itemsRoute);
app.use("/api/cards", cardRoute);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404, "Infomation Not Found"));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMsg = "Ey, a unknow error had been occurs";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMsg = error.message;
  }

  res.status(statusCode).json({ error: errorMsg });
});

export default app;
