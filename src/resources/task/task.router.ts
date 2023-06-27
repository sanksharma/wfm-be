import { Router } from "express";
import { createOne, getMany, reset, updateOne, notify } from "./task.controller";

const router = Router();

router.get("/", getMany);
router.post("/", createOne);
router.put("/", updateOne);
router.get("/reset", reset);
router.get("/notify", notify);

export default router;
