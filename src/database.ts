import * as fs from "fs";
import * as path from "path";
import {Post, User} from "./types";

interface Base {
	users: {
		id: number;
		email: string;
		password: number;
		rate: number;
	}[];
	posts: {
		id: number;
		title: string;
		content: string;
		user_id: number;
		rate: number;
	}[];
	rates: {
		user_id: number;
		post_id: number;
		rate: number;
	}[];
}

let base: Base;
const databasePath = path.resolve(__dirname, "..", "database.json");
export class Database {
	async init(): Promise<boolean | Error> {
		return new Promise((resolve, reject) => {
			fs.readFile(databasePath, (err, data) => {
				if (err) {
					reject(new Error("failed to initialize"));
				} else {
					base = JSON.parse(data.toString());
					resolve(true);
				}
			});
		});
	}

	getUserByMail(mail: string) {
		return base.users.find((val) => {
			return mail.toLowerCase() == val.email.toLowerCase();
		});
	}

	getPostsByUser(params: { user_id?: number, limit?: number, offset?: number }): Post[] {
		const { user_id, limit, offset } = params
		if (user_id || user_id == 0) {
			const posts: Post[] = [];
			const user = base.users.find((val) => {
				return user_id == val.id
			});
			if (!user) {
				return []
			}
			const filtered = base.posts.filter((val) => {
				return val.user_id == user_id;
			});

			for (let i = 0; limit ? i < limit : i < filtered.length; i++) {
				const post = filtered[offset && limit ? (offset - 1) * limit + i : i];
				if (post) {
					posts.push({
						id: post.id,
						title: post.title,
						content: post.content,
						rate: post.rate,
						author: {
							id: user.id,
							email: user.email,
							rate: user.rate
						}
					});
				}
			}
			return posts
		} else {
			const posts: Post[] = [];
			for (let i = 0; limit ? i < limit : i < base.posts.length; i++) {
				const post = base.posts[offset && limit ? (offset - 1) * limit + i : i];
				if (post) {
					const user = base.users.find((val) => {
						return val.id == post.user_id
					})
					posts.push({
						id: post.id,
						title: post.title,
						content: post.content,
						rate: post.rate,
						author: {
							id: user!.id,
							email: user!.email,
							rate: user!.rate
						}
					});
				}
			}
			return posts;
		}
	}
	getUsers(params: { limit?: number, offset?: number, post_limit?: number, post_offset?: number }): User[] {
		const { limit, offset, post_offset, post_limit } = params
		const users: User[] = [];
		for (let i = 0; limit ? i < limit : i < base.posts.length; i++) {
			const user = base.users[offset && limit ? (offset - 1) * limit + i : i];
			if (user) {
				const posts = this.getPostsByUser({limit: post_limit, offset: post_offset, user_id: user.id});
				const result: Post[] = posts.map((value) => {
					return {
						id: value.id,
						title: value.title,
						content: value.content,
						rate: value.rate
					}
				});
				users.push({
					id: user.id,
					email: user.email,
					rate: user.rate,
					posts: result
				});
			}
		}
		return users;
	}
	getPostById(id: number): Post | undefined {
		const post = base.posts.find((val) => {
			return val.id == id
		});
		if (!post) {
			return undefined;
		}
		const user = base.users.find((val) => {
			return val.id == post.user_id;
		});
		return {
			id: post.id,
			title: post.title,
			content: post.content,
			rate: post.rate,
			author: {
				id: user!.id,
				email: user!.email,
				rate: user!.rate
			}
		}
	}
	findPostByTitle(title: string) {
		return base.posts.find((value) => {
			return title.toLowerCase() == value.title.toLowerCase();
		});
	}
	createPost(params: {user_id: number, title: string, content: string}): Post | undefined {
		let id: number = 0
		base.posts.map((val) => {
			if (val.id > id) {
				id = val.id
			}
		});
		const author = base.users.find((val) => {
			return params.user_id == val.id;
		});
		if (!author) {
			return undefined;
		}

		const post: any = {
			id: id + 1,
			title: params.title,
			content: params.content,
			rate: 0,
			user_id: params.user_id
		}
		base.posts.push(post);
		fs.writeFileSync(databasePath, JSON.stringify(base));
		return {
			id: post.id,
			title: post.title,
			content: post.content,
			rate: post.rate,
			author: {
				id: author.id,
				email: author.email,
				rate: author.rate
			}
		}
	}
	setRate(params: {post_id: number, rate: number, user_id: number}) {
		let post_rate: number = 0;
		let user_rate: number = 0;
		const post = base.posts.find((val) => {
			return val.id == params.post_id;
		});
		const rateCandidate = base.rates.find((val) => {
			return (val.user_id == params.user_id) && (val.post_id == post!.id);
		});
		if (rateCandidate) {
			base.rates[base.rates.findIndex((val) => {
				return val == rateCandidate;
			})].rate = params.rate
		} else {
			base.rates.push({
				rate: params.rate,
				post_id: params.post_id,
				user_id: params.user_id
			});
		}
		const rates = base.rates.filter((val) => {
			if (val.post_id == params.post_id) {
				post_rate += val.rate;
			}
			return val.post_id == params.post_id;
		});
		base.posts[base.posts.findIndex((val) => {
			return val.id == post!.id;
		})].rate = post_rate / rates.length;
		const posts = base.posts.filter((val) => {
			if (val.user_id == post!.user_id) {
				user_rate += val.rate;
			}
			return val.user_id == post!.user_id;
		});
		base.users[base.users.findIndex((val) => {
			return val.id == post!.user_id;
		})].rate = user_rate / posts.length;
		fs.writeFileSync(databasePath, JSON.stringify(base));
	}
}