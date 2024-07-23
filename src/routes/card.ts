import express from "express";
import * as CardController from "../controllers/cardController";

const router = express.Router();

router.get("/", CardController.getCards);
router.get("/:cardId", CardController.getCard);
router.post("/", CardController.createCard);
router.patch("/:cardId", CardController.updateCard);
router.delete("/:cardId", CardController.deleteCard);

export default router;
