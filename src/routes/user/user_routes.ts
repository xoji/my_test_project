import {Router} from "express";
import {UserController} from "./user_controller";

const router = Router();
const controller = new UserController();

router.get("/get", controller.get);

export default router;