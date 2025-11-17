import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getShiftApplications,
  approveApplication,
  rejectApplication,
  applyForShift,
  listMyApplications,
  cancelMyApplication,
} from "../controllers/application.controller.js";

/* ---------------------------------------------
   1. router  →  mounted at /api/shifts
      Handles:
        - Apply to a shift
        - Manager viewing shift applications
---------------------------------------------- */
const router = Router();

// ✅ Volunteer applies to a shift
// POST /api/shifts/:shiftId/apply
router.post("/:shiftId/apply", requireAuth, applyForShift);

// ✅ Manager-only guard
const requireManager = (req, res, next) => {
  if (req.userRole !== "manager")
    return res.status(403).json({ message: "Forbidden" });
  next();
};

// ✅ Manager views applications for a specific shift
// GET /api/shifts/:shiftId/applications
router.get(
  "/:shiftId/applications",
  requireAuth,
  requireManager,
  getShiftApplications
);

/* ---------------------------------------------
   2. appRouter  →  mounted at /api/applications
      Handles:
        - My applications
        - Cancel an application
        - Approve / reject (manager)
---------------------------------------------- */
const appRouter = Router();

// ✅ Volunteer: list my applications
// GET /api/applications/my
appRouter.get("/my", requireAuth, listMyApplications);

// ✅ Volunteer: cancel pending application
// DELETE /api/applications/:applicationId
appRouter.delete("/:applicationId", requireAuth, cancelMyApplication);

// ✅ Manager: approve application
// POST /api/applications/:applicationId/approve
appRouter.post(
  "/:applicationId/approve",
  requireAuth,
  requireManager,
  approveApplication
);

// ✅ Manager: reject application
// POST /api/applications/:applicationId/reject
appRouter.post(
  "/:applicationId/reject",
  requireAuth,
  requireManager,
  rejectApplication
);

export default router;
export { appRouter };
