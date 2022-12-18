import {Request, Response} from "express";
import {error} from "../../debug";
import {DefaultRes} from "../../types";
import {Database} from "../../database";
import jwt, {JwtPayload} from "jsonwebtoken";

interface CreateRequest {
	title?: string;
	content?: string;
}

type RateRequest = {
	post_id?: number;
	rate: number;
}

export class PostController {
	get(req: Request, res: Response<DefaultRes>) {
		try {
			const { user_id, limit, offset } = req.query;
			const db = new Database();
			const posts = db.getPostsByUser({
				user_id: parseInt((user_id as string)),
				limit: parseInt((limit as string)),
				offset: parseInt((offset as string))
			});
			res.status(200).json({
				success: true,
				code: 200,
				note: "Success!",
				data: posts
			});
		} catch (e: any) {
			error(new Error(e.message), "PostController - get");
			res.status(200).json({
				success: false,
				code: 503,
				note: "System error, try later!"
			})
		}
	}

	getOne(req: Request, res: Response<DefaultRes>) {
		try {
			const { id } = req.params;
			const db = new Database();
			const post = db.getPostById(parseInt(id));
			if (!post) {
				res.status(200).json({
					success: false,
					code: 404,
					note: "This post doesn't exists!"
				});
				return
			}
			res.status(200).json({
				success: true,
				code: 200,
				note: "Success!",
				data: post
			})
		} catch (e: any) {
			error(new Error(e.message), "PostController - getOne");
			res.status(200).json({
				success: false,
				code: 503,
				note: "System error, try later!"
			});
		}
	}
	create(req: Request<{[key: string]: any}, any, CreateRequest>, res: Response<DefaultRes>) {
		try {
			const { title, content } = req.body;
			if (!title || !content) {
				res.status(200).json({
					success: false,
					code: 400,
					note: "No required data!"
				});
				return
			}
			if (!title.trim() || !content.trim()) {
				res.status(200).json({
					success: false,
					code: 400,
					note: "Fields cannot be empty!"
				});
				return
			}
			const db = new Database();
			const candidate = db.findPostByTitle(title);
			if (candidate) {
				res.status(200).json({
					success: false,
					code: 409,
					note: "This post already exists!"
				});
				return
			}
			const token = jwt.decode(req.headers.authorization!.split(" ")[1]);
			if (!token) {
				res.status(200).json({
					success: false,
					code: 401,
					note: "No authorization!"
				});
				return
			}

			const created = db.createPost({title, content, user_id: (token as JwtPayload).id});
			if (!created) {
				res.status(200).json({
					success: false,
					code: 502,
					note: "Failed, try again later!"
				});
				return
			}
			res.status(200).json({
				success: true,
				code: 200,
				note: "Success!",
				data: created
			});
		} catch (e: any) {
			error(new Error(e.message), "PostController - create");
			res.status(200).json({
				success: false,
				code: 503,
				note: "System error, try later!"
			});
		}
	}
	rate(req: Request<{[key: string]: any}, any, RateRequest>, res: Response<DefaultRes>) {
		try {
			const { post_id, rate } = req.body;
			if (!post_id || !rate) {
				res.status(200).json({
					success: false,
					code: 400,
					note: "No required data!"
				});
				return
			}
			if (rate < 0 || rate > 100) {
				res.status(200).json({
					success: false,
					code: 400,
					note: "Wrong rating!"
				});
				return
			}
			const db = new Database();
			const candidate = db.getPostById(post_id);
			if (!candidate) {
				res.status(200).json({
					success: false,
					code: 400,
					note: "This post doesn't exists!"
				});
				return
			}
			const decoded = jwt.decode(req.headers.authorization!.split(" ")[1]);
			if ((decoded as JwtPayload).id == candidate.author!.id) {
				res.status(200).json({
					success: false,
					code: 400,
					note: "You can't rate your posts!"
				});
				return;
			}
			db.setRate({post_id, rate, user_id: (decoded as JwtPayload).id});
			res.status(200).json({
				success: true,
				code: 200,
				note: "Success!"
			});
		} catch (e: any) {
			error(new Error(e.message), "PostController - rate");
			res.status(200).json({
				success: false,
				code: 503,
				note: "System error, try later!"
			});
		}
	}
}