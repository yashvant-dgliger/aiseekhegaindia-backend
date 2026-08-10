import { Router } from "express";
import { ApplicationStatus, Role } from "@prisma/client";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  adminPatchApplicationSchema,
  createCohortSchema,
  fellowshipApplicationSchema,
  patchCohortSchema,
} from "../validators/schemas.js";
import * as fellowshipService from "../services/fellowship.service.js";
import { param } from "../utils/params.js";

export const fellowshipRouter = Router();
export const adminRouter = Router();

fellowshipRouter.get("/fellowship/cohorts/active", async (_req, res, next) => {
  try {
    const items = await fellowshipService.listActiveCohorts();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

fellowshipRouter.post(
  "/fellowship/applications",
  optionalAuth,
  validate(fellowshipApplicationSchema),
  async (req, res, next) => {
    try {
      const item = await fellowshipService.createApplication(req.body, req.user?.id);
      res.status(201).json({ item });
    } catch (err) {
      next(err);
    }
  },
);

fellowshipRouter.get("/fellowship/applications/me", requireAuth, async (req, res, next) => {
  try {
    const items = await fellowshipService.listMyApplications(req.user!.id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

fellowshipRouter.get("/fellowship/applications/:id", requireAuth, async (req, res, next) => {
  try {
    const item = await fellowshipService.getApplication(param(req.params.id), req.user!);
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

adminRouter.use(requireAuth, requireRole(Role.admin));

adminRouter.get("/admin/applications", async (req, res, next) => {
  try {
    const status = req.query.status as ApplicationStatus | undefined;
    const items = await fellowshipService.adminListApplications(status);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch(
  "/admin/applications/:id",
  validate(adminPatchApplicationSchema),
  async (req, res, next) => {
    try {
      const item = await fellowshipService.adminPatchApplication(
        param(req.params.id),
        req.body,
        req.user!.id,
      );
      res.json({ item });
    } catch (err) {
      next(err);
    }
  },
);

adminRouter.post("/admin/cohorts", validate(createCohortSchema), async (req, res, next) => {
  try {
    const item = await fellowshipService.createCohort(req.body);
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/admin/cohorts/:id", validate(patchCohortSchema), async (req, res, next) => {
  try {
    const item = await fellowshipService.patchCohort(param(req.params.id), req.body);
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/admin/users", async (_req, res, next) => {
  try {
    const items = await fellowshipService.adminListUsers();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});
