import {Router} from "express";
import auth_routes from "./auth/auth_routes";
import {authGuard} from "../middleware/auth_guard";
import post_routes from "./post/post_routes";
import user_routes from "./user/user_routes";

const router = Router();

router.use("/api/auth", auth_routes);
router.use(authGuard);
router.use("/api/posts", post_routes);
router.use("/api/users", user_routes);

export default router;