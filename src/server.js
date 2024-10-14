import fastify from "fastify";
import rawBody from "fastify-raw-body"; 
import RedisHelper from "./redisHelper.js";
import {
	InteractionType,
	verifyKey, 
} from "discord-interactions";
import fastifyRedis from '@fastify/redis';
import { 
	Client, 
	GatewayIntentBits,
} from "discord.js";

import { guess } from "./utils/number.js";
import { handleApplicationCommand } from "./commandHandlers/applicationCommand.js";
import { handleModalSubmit } from "./commandHandlers/modalSubmit.js";
import { handleMessageComponentCommand } from "./commandHandlers/messageComponent.js";
import fastifyPostgres from "@fastify/postgres";
import routes from "./routes/index.js";
let channelManager;
let guildManager;
const server = fastify({
	logger: true,
});

server.register(fastifyRedis, { host: '127.0.0.1', port: 6379});
// server.register(fastifyPostgres, {
// 	connectionString: process.env.POSTGRES_URL
// });

server.register(routes);

server.register(rawBody, {
	runFirst: true,
});

server.get("/", (request, response) => {
	server.log.info("Handling GET request");
});
 
server.addHook("preHandler", async (request, response) => { 
	if (request.method === "POST") {
		const signature = request.headers["x-signature-ed25519"];
		const timestamp = request.headers["x-signature-timestamp"]; 
		const rawBody = JSON.stringify(request.body);
		const isValidRequest = await verifyKey(
			rawBody, 
			signature, 
			timestamp, 
			process.env.PUBLIC_KEY,
		);
		if (!isValidRequest) {
			server.log.info("Invalid Request"); 
			return response.status(401).send({ error: "Bad request signature " }); 
		} 
	} 
}); 
 
server.post("/", async (request, response) => {
	const message = request.body;
	const { redis } = server;
	const redisHelper = new RedisHelper(redis);

  if (message.type === InteractionType.APPLICATION_COMMAND) {
		await handleApplicationCommand(client, message, redisHelper, response);
	} else if (message.type === InteractionType.MODAL_SUBMIT) {
		await handleModalSubmit(channelManager, guildManager, message, redisHelper, response);
	} else if (message.type === InteractionType.MESSAGE_COMPONENT) {
		await handleMessageComponentCommand(message, redisHelper, response);
	}
	else {
		server.log.error("Unknown Type: ", message.type);
		response.status(400).send({ error: "Unknown Type" });
	}
});
 
server.listen(3001, async (error, address) => {
	if (error) {
		server.log.error(error);
		process.exit(1);
	}
	server.log.info(`server listening on ${address}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
  ],
});
client.on('ready', async () => {

	channelManager = client.channels;
	guildManager = client.guilds;
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (!message.author.bot) {
		const { redis } = server;

		const redisHelper = new RedisHelper(redis);
		const res = await guess(redisHelper, message);

		if (res && res.success)
			message.reply(res.msg);
  }
});
console.log(process.env.TOKEN);
client.login(process.env.TOKEN);
