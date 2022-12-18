import {Request, Response} from "express";
import {error} from "../../debug";
import {DefaultRes} from "../../types";
import {Database} from "../../database";

export class UserController {
	get(req: Request, res: Response<DefaultRes>) {
		try {
			const { limit, offset, post_offset, post_limit } = req.query;
			const db = new Database();
			const users = db.getUsers({
				limit: parseInt((limit as string)),
				offset: parseInt((offset as string)),
				post_offset: parseInt((post_offset as string)),
				post_limit: parseInt((post_limit as string))
			});
			res.status(200).json({
				success: true,
				code: 200,
				data: users,
				note: "Success!"
			});
		} catch (e: any) {
			error(new Error(e.message), "UserController - get");
			res.status(200).json({
				success: false,
				code: 503,
				note: "System error, try later!"
			})
		}
	}
}