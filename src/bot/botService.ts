import fetch from "node-fetch";
import BotPhotoResponse from "../models/botPhotoResponse";
import BotTextResponse from "../models/botTextResponse";
import BotResponse from "../models/botResponse";
import { User } from "../models/user";
import { TelegramAccountsRepository } from "../repositories/telegramAccountsRepository";
import { mongoClient } from "../handler";
import { strings } from "./strings";
import { botCommands } from "./commands";

const TOKEN = process.env.TELEGRAM_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

export async function validateRequestUser(body: any): Promise<boolean> {
    let user: User | undefined = undefined;
    let chatId = body.message?.chat?.id ?? body.callback_query.message.chat.id;
    let message = '';

    if(body.message) {
        user = body.message.from as User;
        message = body.message.text;
    } else if(body.callback_query) {
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

    if(message == botCommands.start || 
        message == botCommands.randomWod || 
        message == botCommands.needMoreFunctionality)
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

export function sendMessage(responseMessage: BotTextResponse): Promise<fetch.Response> {
    return sendToBot('sendMessage', responseMessage);
}

export function sendPhoto(responseMessage: BotPhotoResponse): Promise<fetch.Response> {
    return sendToBot('sendPhoto', responseMessage);
}

function sendToBot(endpoint: string, response: BotResponse): Promise<fetch.Response> {
    return fetch(`${TELEGRAM_API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
    });
}