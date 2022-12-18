import {Database} from "./database";
import {error} from "./debug";
import express from "express";
import routes from "./routes/routes";
import cors from "cors"

const app = express();

const port: number = 4100
const host: string = "localhost"
const database = new Database();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);


async function start() {
	try {
		app.listen(port, host, async () => {});
		await database.init();
	} catch (e: any) {
		error(new Error(e.message), "start");
	}
}

start().then(() => {
	console.log(`App started on port ${port}`);
});