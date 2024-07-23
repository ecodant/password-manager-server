import express from "express";
import * as ItemController from "../controllers/itemController"

const router = express.Router();

router.get("/", ItemController.getItems);
router.get("/:itemId", ItemController.getItem);
router.post("/", ItemController.createItem);
router.patch("/:itemId", ItemController.updatedItem);
router.delete("/:itemId", ItemController.deleteItem);

export default router; 