import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  updateMeSchema,
} from "../validators/schemas.js";
import * as authService from "../services/auth.service.js";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post("/auth/register", authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/auth/login", authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/auth/refresh", validate(refreshSchema), async (req, res, next) => {
  try {
    const result = await authService.refreshSession(req.body.refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/auth/logout", requireAuth, async (req, res, next) => {
  try {
    await authService.logoutUser(req.user!.id, req.body?.refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

authRouter.patch("/me", requireAuth, validate(updateMeSchema), async (req, res, next) => {
  try {
    const user = await authService.updateMe(req.user!.id, req.body.displayName);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});
