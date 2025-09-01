import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import fetch from "node-fetch";
import { WodsRepository } from "./repositories/wodsRepository";
import BotTextResponse from "./models/botTextResponse";
import { MongoClient } from "mongodb";
import { sendMessage, sendPhoto } from "./bot/botService";
import { botCommands } from "./bot/commands";
import { strings } from "./bot/strings";
import { send } from "process";
import { User } from "./models/user";
import { TelegramAccountsRepository } from "./repositories/telegramAccountsRepository";

const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING!);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body)
        return { statusCode: 400, body: "No body" };

    const body = JSON.parse(event.body);

    if(!(await validateRequestUser(body)))
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

async function validateRequestUser(body: any): Promise<boolean> {
    let user: User | undefined = undefined;
    let chatId = body.message?.chat?.id ?? body.callback_query.message.chat.id;
    let message = '';

    if(body.message) {
        user = body.message.from as User;
        message = body.message.text;
    }
     else if(body.callback_query) {
        user = body.callback_query.from as User;
        message = body.callback_query.data;
    }

    if(user) {
        const tgAccountRepo = new TelegramAccountsRepository(mongoClient.db(process.env.DB_NAME));
        if(await tgAccountRepo.isBanned(user.id)) {
            await sendMessage({
                chat_id: chatId,
                text: strings.userBanned
            });
            return false;
        }
    }

    if(message == botCommands.start || message == botCommands.randomWod || botCommands.needMoreFunctionality)
        return true;

    if(!user) {
        await sendMessage({
            chat_id: chatId,
            text: strings.cantIdentifyUser
        });
        return false;
    }

    if(user.is_bot) {
        await sendMessage({
            chat_id: chatId,
            text: strings.botsNotAllowed
        });
        return false;
    }

    if(user.username == undefined) {
        await sendMessage({
            chat_id: chatId,
            text: strings.usernameNotDefined
        });
        return false;
    }

    return true;
}

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
    } else {
        await sendMessage({chat_id: chatId, text: strings.unknownRequest(request)});
    }
}

async function handleReplyMessage(message: any): Promise<void> {
    const text = message.reply_to_message.text as string;
    await sendMessage({
        chat_id: message.chat.id,
        text: JSON.stringify(text.startsWith(strings.unitRegistration))
    });

    if(text.startsWith(strings.unitRegistration)) {
        await sendMessage({
            chat_id: (process.env.HERO_BOOK_ADMIN_GROUP as unknown) as number,
            text: strings.unitRegistrationRequest(message.text, message.from.username),
            reply_markup: {
                inline_keyboard: [[
                    {text: 'Затвердити', callback_data: botCommands.randomWod },
                    {text: 'Відхилити', callback_data: botCommands.registerVeteranBusiness}
                ]]
            }
        });
    } else if (text.startsWith(strings.businessRegistration)) {

    } else {

    }
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