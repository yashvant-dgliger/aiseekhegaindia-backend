import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { upsertProgressSchema } from "../validators/schemas.js";
import * as progressService from "../services/progress.service.js";
import { param } from "../utils/params.js";

export const progressRouter = Router();

progressRouter.get("/progress", requireAuth, async (req, res, next) => {
  try {
    const items = await progressService.listProgress(req.user!.id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

progressRouter.put(
  "/progress/:docSlug",
  requireAuth,
  validate(upsertProgressSchema),
  async (req, res, next) => {
    try {
      const item = await progressService.upsertProgress(
        req.user!.id,
        param(req.params.docSlug),
        req.body,
      );
      res.json({ item });
    } catch (err) {
      next(err);
    }
  },
);

progressRouter.delete("/progress/:docSlug", requireAuth, async (req, res, next) => {
  try {
    await progressService.deleteProgress(req.user!.id, param(req.params.docSlug));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

progressRouter.get("/bookmarks", requireAuth, async (req, res, next) => {
  try {
    const items = await progressService.listBookmarks(req.user!.id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

progressRouter.put("/bookmarks/:docSlug", requireAuth, async (req, res, next) => {
  try {
    const item = await progressService.putBookmark(req.user!.id, param(req.params.docSlug));
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

progressRouter.delete("/bookmarks/:docSlug", requireAuth, async (req, res, next) => {
  try {
    await progressService.deleteBookmark(req.user!.id, param(req.params.docSlug));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
