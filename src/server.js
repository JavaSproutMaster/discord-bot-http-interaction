import fastify from "fastify";
import rawBody from "fastify-raw-body"; 
import RedisHelper from "./redisHelper.js";
import { guessNumber, startNumberGame, endNumberGame } from "./utils/number.js";
import {
	InteractionResponseType,
	InteractionType,
	verifyKey, 
} from "discord-interactions";
import fastifyRedis from '@fastify/redis';
import { Client, GatewayIntentBits } from "discord.js";

import { 
  SLAP_COMMAND, 
  INVITE_COMMAND, 
  START_NUMBER_GAME, 
  GUESS_NUMBER,
  END_NUMBER_GAME,
	END_WORD_GAME,
	END_EMOJI_GAME,
  START_WORD_GAME,
  GUESS_LETTER,
  GUESS_WORD,
  START_EMOJI_GAME,
	GUESS_EMOJI,
} from "./commands/index.js";
import { endWordGame, guessLetter, guessWord, startWordGame } from "./utils/word.js";
import NumberGame from "./guess/number.js";
import { guess } from "./utils/utils.js";
const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${process.env.APPLICATION_ID}&scope=applications.commands`;

const server = fastify({
	logger: true,
});
server.register(fastifyRedis, { host: '127.0.0.1', port: 6379});

server.register(rawBody, {
	runFirst: true,
});

server.get("/", (request, response) => {
	server.log.info("Handling GET request");
});
 
server.addHook("preHandler", async (request, response) => { 
	// We don't want to check GET requests to our root url
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
		console.log(isValidRequest);
		if (!isValidRequest) {
			server.log.info("Invalid Request"); 
			return response.status(401).send({ error: "Bad request signature " }); 
		} 
	} 
}); 
 
server.post("/", async (request, response) => {
	const message = request.body;
	if (message.type === InteractionType.PING) {
		server.log.info("Handling Ping request");
		response.send({
			type: InteractionResponseType.PONG,
		});
	} else if (message.type === InteractionType.APPLICATION_COMMAND) {
		const { redis } = server;

		const redisHelper = new RedisHelper(redis);
		
		switch (
			message.data.name.toLowerCase() 
		) {
			case SLAP_COMMAND.name.toLowerCase():
				response.status(200).send({
					type: 4, 
					data: {
						content: `*<@${message.member.user.id}> slaps <@${message.data.options[0].value}> around a bit with a large trout*`,
					}, 
				}); 
				server.log.info("Slap Request"); 
				break; 
			case INVITE_COMMAND.name.toLowerCase(): 
				response.status(200).send({
					type: 4, 
					data: {
						content: INVITE_URL, 
						flags: 64, 
					},
				});
				server.log.info("Invite request"); 
				break;
			case START_NUMBER_GAME.name.toLowerCase():
				const res = await startNumberGame(redisHelper, message);
				
				response.status(200).send({
					type: 4, 
					data: {
						content: `*${res.msg}*`, 
					}, 
				});	
				break;
			case GUESS_NUMBER.name.toLowerCase():
				const res1 = await guessNumber(redisHelper, message);
				if (res1.success) {
					response.status(200).send({
						type: 4, 
						data: {
							content: `*Congratulations 🏆🏆🏆! <@${message.member.user.id}> guessed the correct number: ${res1.value}*`, 
						}, 
					});	
				}
				else {
					response.status(200).send({
						type: 4, 
						data: {
							content: `*${res1.msg}*`, 
							flags: 64,
						}, 
					});	
				}
				break;
			case END_NUMBER_GAME.name.toLowerCase():
				const result = await endNumberGame(redisHelper, message);
				response.status(200).send({
					type: 4, 
					data: {
						content: `*${result}*`, 
					}, 
				});
				break;
			case START_WORD_GAME.name.toLowerCase():
				const resWordGame = await startWordGame(redisHelper, message);
				response.status(200).send({
					type: 4, 
					data: {
						content: `*${resWordGame}*`, 
					}, 
				});
				break;
			case GUESS_LETTER.name.toLowerCase():
				console.log('** guess letter game **');
				const rGuessLetterGame = await guessLetter(redisHelper, message);
				response.status(200).send({
					type: 4, 
					data: {
						content: `*${rGuessLetterGame.message}*`, 
						flags: 64,
					}, 
				});
				break;
			case GUESS_WORD.name.toLowerCase():
				console.log('** guess word game **');
				const rGuessWordGame = await guessWord(redisHelper, message);

				if (rGuessWordGame.success) {
					response.status(200).send({
						type: 4, 
						data: {
							content: `*Congratulations! <@${message.member.user.id}> guessed the correct word: ${rGuessWordGame.value}*`, 
						}, 
					});
				}
				else 
					response.status(200).send({
						type: 4, // Response with content
						data: {
							content: `${rGuessWordGame.message}`, // Empty content (no visible message)
							flags: 64, // Ephemeral message flag (only the user sees it)
						},
					});
				break;
			case END_WORD_GAME.name.toLowerCase():
				const rEndWord = await endWordGame(redisHelper, message);
				response.status(200).send({
					type: 4, 
					data: {
						content: `*${rEndWord}*`, 
					}, 
				});
				break;
			case START_EMOJI_GAME.name.toLowerCase():
				console.log('** started emoji game **');
				break;

			default:
				server.log.error("Unknown Command"); 
				response.status(400).send({ error: "Unknown Type" }); 
				break; 
		} 	
	}
		else {
		server.log.error("Unknown Type");
		response.status(400).send({ error: "Unknown Type" });
	}
});
 
server.listen(3000, async (error, address) => {
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
  ],
});
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
	const customEmoji = '<:gs:1283619649308594206>';
  if (!message.author.bot) {
		console.log(JSON.stringify(message));
		// message.reply(`Congritulations ! ${customEmoji}`)

		message.author.send(`Congritulations ! ${customEmoji}`);

		const { redis } = server;

		const redisHelper = new RedisHelper(redis);
		const res = await guess(redisHelper, message);
    console.log(`Message in ${message.channel.name}: ${message.content}`);

		if (res && res.success)
			message.reply(res.msg);
  }
});

client.login(process.env.TOKEN);
