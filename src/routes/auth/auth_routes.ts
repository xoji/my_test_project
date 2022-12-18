import {Router} from "express";
import {AuthController} from "./auth_controller";

const router = Router();
const controller = new AuthController();

router.post("/login", controller.login);

export default router;