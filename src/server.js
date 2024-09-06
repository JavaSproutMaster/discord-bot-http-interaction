import fastify from "fastify";
import rawBody from "fastify-raw-body"; 
// const getRawBody = require('raw-body');
// import getRawBody from "raw-body";
import {
	InteractionResponseType,
	InteractionType,
	verifyKey, 
} from "discord-interactions";

import { SLAP_COMMAND, INVITE_COMMAND } from "./commands.js";

const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${process.env.APPLICATION_ID}&scope=applications.commands`; 

const server = fastify({
	logger: true,
});
 
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
  console.log('**************************************************************** recieved message ********************************');
  console.log(message);
	if (message.type === InteractionType.PING) {
		server.log.info("Handling Ping request");
		response.send({
			type: InteractionResponseType.PONG,
		});
	} else if (message.type === InteractionType.APPLICATION_COMMAND) {
		console.log(JSON.stringify(message));
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