import { Router } from "express";
import { createOne, getMany, updateOne } from "./task.controller";

const router = Router();

router.get("/", getMany);
router.post("/", createOne);
router.put("/", updateOne);

export default router;
