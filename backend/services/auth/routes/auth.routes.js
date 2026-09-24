import express from "express";

import {
  deductCredits,
  login,
  logout,
  updatePlan,
  setUserCredits,
  getCostsHandler,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/login", login);
router.get("/logout", logout);
router.get("/credit-costs", getCostsHandler);
router.get("/internal/credit-costs", getCostsHandler);
router.patch("/internal/update-plan", updatePlan);
router.patch("/internal/deduct-credits", deductCredits);
router.post("/internal/set-credits", setUserCredits);

export default router;