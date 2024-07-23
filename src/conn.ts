import "dotenv/config";
import app from "./app";
import env from "../src/util/envValidation";
import mongoose from "mongoose";

mongoose
  .connect(env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("Todo Ok");
    app.listen(env.PORT, () => {});
  })
  .catch(console.error);
