import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import fetch from "node-fetch";
import { WodsRepository } from "./repositories/wodsRepository";
import BotTextResponse from "./models/botTextResponse";
import { MongoClient } from "mongodb";
import { sendMessage, sendPhoto } from "./bot/botService";
import { botCommands } from "./bot/commands";

const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING!);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body)
        return { statusCode: 400, body: "No body" };

    const body = JSON.parse(event.body);

    if (body.message) {
        const chatId = body.message.chat.id;
        const text = body.message.text || "";

        if (text === botCommands.start) {
            let userName = body.message.from.username;
            if(knowsUsers.has(userName))
                await greetKnownUser(chatId, userName);
            else
                await greetUnknownUser(chatId, userName);
        }
         else if(text == botCommands.randomWod) {
            await sendRandomWod(chatId);
        } else {
            await sendMessage({
                chat_id: chatId,
                text: `You said: ${text}`
            });
        }
    } else if(body.callback_query) {
        const request = body.callback_query.data;

        if(request == 'get_random_wod') {
            await sendRandomWod(body.callback_query.message.chat.id);
        } else {
            await sendMessage({
                chat_id: body.callback_query.message.chat.id,
                text: `You asked to: ${request}`
            });
        }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

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
        text: "Схоже, ми ще не знайомі. Я бот Книги Героїв, допомагаю по дрібницях. Чим можу вам допомогти?",
        reply_markup: {
            inline_keyboard: [
                [{text: 'Дай рандомний воркаут', callback_data: 'get_random_wod'}],
                [{text: 'Зараєструвати бізнес', callback_data: 'register_business'}],
                [{text: 'Зараєструвати підрозділ', callback_data: 'register_unit'}],
                [{text: 'Чому так мало функціоналу?', callback_data: 'need_more_functions'}],
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
        caption: `${wod.name}\n
Дата виконання: ${wod.executionDate.toLocaleDateString("uk-UA", {month:'long',day:'numeric'})}
Схема:\n${wod.scheme}`
    });
}