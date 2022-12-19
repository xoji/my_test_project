export interface User {
	id: number;
	email: string;
	password?: number;
	posts?: Post[];
	rate: number
}

export interface Post {
	id: number;
	title: string;
	content: string;
	rate: number;
	read_speed: number;
	author?: User;
}

export interface DefaultRes<Data = any> {
	success: boolean;
	code: number;
	data?: Data;
	note: string;
}