import { Router } from "express";
import { createOne, getMany, reset, updateOne } from "./task.controller";

const router = Router();

router.get("/", getMany);
router.post("/", createOne);
router.put("/", updateOne);
router.get("/reset", reset);

export default router;
