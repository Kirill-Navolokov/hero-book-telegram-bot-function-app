import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { MongoClient } from "mongodb";
import { greetUser, sendMessage, validateRequestUser } from "./bot/botService";
import { botCommands } from "./bot/commands";
import { strings } from "./bot/strings";
import { TgUser } from "./models/tgUser";
import { handleUnitRegistration, handleUnitRegistrationResult } from "./commandHandlers/unitsHandler";
import { sendRandomWod } from "./commandHandlers/wodsHandler";
import { handleUserManagement } from "./commandHandlers/usersHandler";

export const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING!);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body)
        return { statusCode: 400, body: "No body" };
        
    const isAuthenticated = authenticateCaller(event);
    if(!isAuthenticated)
        return {statusCode: 200, body: "{ok:true}"};

    const body = JSON.parse(event.body);
    const isValidUser = await validateRequestUser(body);

    if(!isValidUser)
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
                await greetUser(chatId, body.message.from.id);
            } else if(text == botCommands.randomWod) {
                await sendRandomWod(chatId);
            } else {
                await sendMessage({chat_id: chatId, text: `You said: ${text}`});
            }
        }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

function authenticateCaller(event: any): boolean {
    const headers = Object.fromEntries(
        Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v])
    );

    if (event.requestContext?.http?.method !== 'POST')
        return false;

    const secretHeader = headers['x-telegram-bot-api-secret-token'];
    if (!secretHeader || secretHeader !== process.env.TELEGRAM_SECRET)
        return false;

    return true;
}

async function handleCallbackQuery(callbackQuery: any): Promise<void> {
    const request:string = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const user = callbackQuery.from as TgUser;

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
    } 
    // else if(request == botCommands.registerVeteranBusiness) {
    //     await sendMessage({
    //         chat_id: chatId,
    //         text: ''
    //     });
    // }
    else if(request.startsWith(botCommands.registration)) {
        if(request.includes('unit')){
            await handleUnitRegistrationResult(
                chatId,
                callbackQuery.message.message_id,
                request,
                callbackQuery.message.text);
        } else {
            //handle business registration
        }
    } else if(request.startsWith(botCommands.management)) {
        if(request.includes('user')) {
            await handleUserManagement(chatId, user.id, request);
        } else {
            //await handleBusinessManagement(callbackQuery);
        }

    } else {
        await sendMessage({chat_id: chatId, text: strings.unknownRequest(request)});
    }
}

async function handleReplyMessage(message: any): Promise<void> {
    const text = message.reply_to_message.text as string;
    const user = message.from as TgUser;
    const chatId = message.chat.id;

    if(text.startsWith(strings.unitRegistration)) {
        await handleUnitRegistration(user, chatId, message.text);
    } else if (text.startsWith(strings.businessRegistration)) {
        //await handleBusinessRegistration(user, chatId, text);
    } else {
        await sendMessage({chat_id: chatId, text: strings.unknownRequest(text)});
    }
}