import {NextFunction, Request, Response} from "express";
import {DefaultRes} from "../types";
import {error} from "../debug";
import jwt from "jsonwebtoken";

export function authGuard(req: Request, res: Response<DefaultRes>, next: NextFunction) {
	try {
		const { authorization } = req.headers;
		if (!authorization) {
			res.status(200).json({
				success: false,
				code: 401,
				note: "No authorization!"
			});
			return
		}
		if (!jwt.verify(authorization.split(" ")[1], "49c341a8-73af-4d3e-ac45-21a3f2e2cb3d")) {
			res.status(200).json({
				success: false,
				code: 401,
				note: "No authorization!"
			});
			return
		}
		next();
	} catch (e: any) {
		error(new Error(e.message), "authGuard");
		res.status(200).json({
			success: false,
			code: 500,
			note: "System error, try later!"
		});
	}
}