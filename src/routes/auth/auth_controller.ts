import {Request, Response} from "express";
import {error} from "../../debug";
import {DefaultRes} from "../../types";
import {Database} from "../../database";
import jwt from "jsonwebtoken";

interface LoginRequest {
	mail?: string;
	password?: number;
}

type LoginResponse = {
	id: number;
	email: string;
	token: string;
}

export class AuthController {
	login(req: Request<{[key: string]: any}, any, LoginRequest>, res: Response<DefaultRes<LoginResponse>>) {
		try {
			const { mail, password } = req.body;
			if (!mail || !password) {
				res.status(200).json({
					success: false,
					code: 401,
					note: "No required data!"
				});
				return
			}
			const db = new Database()
			const candidate = db.getUserByMail(mail);
			if (!candidate) {
				res.status(200).json({
					success: false,
					code: 401,
					note: "Wrong email or password!"
				});
				return
			}
			if (candidate.password != password) {
				res.status(200).json({
					success: false,
					code: 401,
					note: "Wrong email or password!"
				});
				return
			}
			const token = jwt.sign({
				id: candidate.id,
				mail: candidate.email
			}, "49c341a8-73af-4d3e-ac45-21a3f2e2cb3d");
			res.status(200).json({
				success: true,
				code: 200,
				note: "Success!",
				data: {
					id: candidate.id,
					email: candidate.email,
					token
				}
			});
		} catch (e: any) {
			error(new Error(e.message), "login");
			res.status(200).json({
				success: false,
				code: 503,
				note: "System error!"
			});
		}
	}
}