import {Router} from "express";
import {PostController} from "./post_controller";

const router = Router();
const controller = new PostController();

router.get("/get", controller.get);
router.get("/get/:id", controller.getOne);
router.post("/new", controller.create);
router.post("/rate", controller.rate)

export default router;