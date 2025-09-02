import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { MongoClient } from "mongodb";
import { greetUser, sendMessage, validateRequestUser } from "./bot/botService";
import { botCommands } from "./bot/commands";
import { strings } from "./bot/strings";
import { User } from "./models/user";
import { handleUnitRegistration } from "./commandHandlers/unitsHandler";
import { sendRandomWod } from "./commandHandlers/wodsHandler";
import test from "node:test";

export const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING!);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body)
        return { statusCode: 400, body: "No body" };

    const body = JSON.parse(event.body);
    const isValidUser = await validateRequestUser(body);

    if(!isValidUser)
        // ALSO CHECK IF USER IS KNOWN
        return { statusCode: 200, body: JSON.stringify({ message: 'Request user validation failed' }) };

    if(body.callback_query) {
        await handleCallbackQuery(body.callback_query);
    } else if (body.message) {
        if(body.message.reply_to_message) {
            await handleReplyMessage(body.message);
        } else {
            const chatId = body.message.chat.id;
            const text = body.message.text || "";

            if (text == botCommands.start) {
                await greetUser(chatId);
            } else if(text == botCommands.randomWod) {
                await sendRandomWod(chatId);
            } else {
                await sendMessage({chat_id: chatId, text: `You said: ${text}`});
            }
        }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};



async function handleCallbackQuery(callbackQuery: any): Promise<void> {
    const request = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;

    if(request == botCommands.randomWod) {
        await sendRandomWod(chatId);
    } else if(request == botCommands.needMoreFunctionality) {
        await sendMessage({chat_id: chatId, text: strings.downloadApps});
    } else if(request == botCommands.registerUnit) {
        await sendMessage({
            chat_id: chatId,
            text: strings.unitRegistrationExplanation,
            reply_markup: {force_reply: true}
        });
    } else if(request == botCommands.registerVeteranBusiness) {
        await sendMessage({
            chat_id: chatId,
            text: ''
        });
    } else if(request.startsWith(botCommands.registration)) {
        await sendMessage({chat_id: chatId, text: request });
    } else {
        await sendMessage({chat_id: chatId, text: strings.unknownRequest(request)});
    }
}

async function handleReplyMessage(message: any): Promise<void> {
    const text = message.reply_to_message.text as string;
    const user = message.from as User;
    const chatId = message.chat.id;

    if(text.startsWith(strings.unitRegistration)) {
        await handleUnitRegistration(user, chatId, message.text);
    } else if (text.startsWith(strings.businessRegistration)) {
        //await handleBusinessRegistration(user, chatId, text);
    } else {

    }
}