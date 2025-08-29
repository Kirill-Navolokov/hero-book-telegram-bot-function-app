import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import fetch from "node-fetch";
import { WodsRepository } from "./repositories/wodsRepository";
import BotTextResponse from "./models/botTextResponse";
import { MongoClient } from "mongodb";
import { sendMessage, sendPhoto } from "./bot/botService";
import { botCommands } from "./bot/commands";
import { strings } from "./bot/strings";

const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING!);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body)
        return { statusCode: 400, body: "No body" };

    const body = JSON.parse(event.body);

    if(body.callback_query) {
        await handleCallbackQuery(body.callback_query);
    } else if (body.message) {
        if(body.message.reply_to_message) {
            await handleReplyMessage(body.message);
        } else {
            const chatId = body.message.chat.id;
            const text = body.message.text || "";

            if (text == botCommands.start) {
                let userName = body.message.from.username;
                if(knowsUsers.has(userName))
                    await greetKnownUser(chatId, userName);
                else
                    await greetUnknownUser(chatId, userName);
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
    } else {
        await sendMessage({chat_id: chatId, text: strings.unknownRequest(request)});
    }
}

async function handleReplyMessage(message: any): Promise<void> {
    const text = message.reply_to_message.text as string;
    // if(text.startsWith(strings.unitRegistration)) {
        await sendMessage({
            chat_id: (process.env.HERO_BOOK_ADMIN_GROUP as unknown) as number,
            text: strings.unitRegistrationRequest(message.text, message.from.username),
            reply_markup: {
                inline_keyboard: [[
                    {text:'Затвердити'},
                    {text:'Відхилити'}
                ]]
            }
        });
    // } else if (text.startsWith(strings.businessRegistration)) {

    // } else {

    // }
}

const knowsUsers = new Set<string>();

async function greetKnownUser(chatId: string, userName: string): Promise<fetch.Response> {
    let responseMessage: BotTextResponse = {
        chat_id: chatId,
        text: "Привіт, " + userName + ", чим можу бути корисний",
        reply_markup: {
            inline_keyboard: [[
                { text: 'Зараєструвати бізнес', callback_data: 'register_business' },
                { text: 'Зараєструвати підрозділ', callback_data: 'register_unit' }
            ]]
        }
    }

    return await sendMessage(responseMessage);
}

async function greetUnknownUser(chatId: string, userName: string): Promise<fetch.Response> {
    let responseMessage: BotTextResponse = {
        chat_id: chatId,
        text: strings.greetUnknownUser,
        reply_markup: {
            inline_keyboard: [
                [{text: strings.getRandomWod, callback_data: botCommands.randomWod}],
                [{text: strings.reginsterVeteranBusiness, callback_data: botCommands.registerVeteranBusiness}],
                [{text: strings.registerUnit, callback_data: botCommands.registerUnit}],
                [{text: strings.needMoreFunctionality, callback_data: botCommands.needMoreFunctionality}],
            ]
        }
    }

    return await sendMessage(responseMessage);
}

async function sendRandomWod(chatId: string) : Promise<fetch.Response> {
    let wodsRepo = new WodsRepository(mongoClient.db(process.env.DB_NAME));
    let wod = await wodsRepo.getRandomWod();

    return await sendPhoto({
        chat_id: chatId,
        photo: wod.imageUrl,
        caption: strings.wodMessageTemplate(wod.name, wod.executionDate, wod.scheme)
    });
}