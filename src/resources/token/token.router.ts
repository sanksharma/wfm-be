import { Router } from "express";
import { createOne } from "./token.controller";

const router = Router();

router.post("/", createOne);

export default router;
