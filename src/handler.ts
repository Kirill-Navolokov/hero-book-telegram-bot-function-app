import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import fetch from "node-fetch";
import BotResponseMessage from "./models/botResponseMessage";
import { send } from "process";
import { iocContainer } from "./ioc/container";
import { WodsRepository } from "./repositories/wodsRepository";
import { TYPES } from "./ioc/typesMap";

const TOKEN = process.env.TELEGRAM_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessage(responseMessage: BotResponseMessage): Promise<fetch.Response> {
    return await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responseMessage),
    });
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body)
        return { statusCode: 400, body: "No body" };
    const wodsRepo = await iocContainer.getAsync<WodsRepository>(TYPES.WodsRepo);

    const body = JSON.parse(event.body);

    if (body.message) {
        const chatId = body.message.chat.id;
        const text = body.message.text || "";

        if (text === "/start") {
            let userName = body.message.from.username;
            if(knowsUsers.has(userName))
                await greetKnownUser(chatId, userName);
            else
                await greetUnknownUser(chatId, userName);
        } else {
        await sendMessage({
                chat_id: chatId,
                text: `You said: ${text}`
            });
        }
    } else if(body.callback_query) {
        const request = body.callback_query.data;

        if(request == 'get_random_wod') {
            let wod = await wodsRepo.getRandomWod();

            await sendMessage({
                chat_id: body.callback_query.message.chat.id,
                parse_mode: 'MarkdownV2',
                //text: `(${wod.imageUrl})\n*${wod.name}*\nДата виконання: ${wod.executionDate}\n\nСхема:\n${wod.scheme}`
                text: `*${wod.name}*\n
                Дата виконання: ${wod.executionDate.toLocaleDateString("uk-UA", {month:'long',day:'numeric'})}\n
                Схема:\n${wod.scheme}`
            })
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
    let responseMessage: BotResponseMessage = {
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
    let responseMessage: BotResponseMessage = {
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