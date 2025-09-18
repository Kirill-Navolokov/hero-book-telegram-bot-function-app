import fetch from "node-fetch";
import BotPhotoResponse from "../models/botPhotoResponse";
import BotTextResponse from "../models/botTextResponse";
import { TgUser } from "../models/tgUser";
import { TelegramAccountsRepository } from "../repositories/telegramAccountsRepository";
import { mongoClient } from "../handler";
import { strings } from "./strings";
import { botCommands } from "./commands";
import BotDeleteMessageResponse from "../models/botDeleteMessageResponse";
import { UnitRegistrationsRepository } from "../repositories/unitRegistrationsRepository";
import { UnitsRepository } from "../repositories/unitsRepository";
import { Unit } from "../models/unit";
import { User } from "../models/user";
import { UsersRepository } from "../repositories/usersRepository";

const TOKEN = process.env.TELEGRAM_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

export async function greetUser(chatId: string, userId: number): Promise<fetch.Response> {
    const db = mongoClient.db(process.env.DB_NAME);
    const unitRegistrationsRepo = new UnitRegistrationsRepository(db);
    const unitRequestUnderReview = await unitRegistrationsRepo.requestFromUserExists(userId);
    let user: User|null = null;

    if(!unitRequestUnderReview) {
        const usersRepo = new UsersRepository(db);
        user = await usersRepo.getByTelegramId(userId);
    }

    let responseMessage: BotTextResponse = {
        chat_id: chatId,
        text: getGreetingMessage(unitRequestUnderReview, user),
        reply_markup: {
            inline_keyboard: getStartInlineKeyboard(unitRequestUnderReview, user)
        }
    }

    return await sendMessage(responseMessage);
}

function getStartInlineKeyboard(
    unitRequestUnderReview: boolean,
    user: User|null
) : Array<Array<{text: string; callback_data: string}>> {
    const keyboardButtons = [
        [{text: strings.getRandomWod, callback_data: botCommands.randomWod}],
        //[{text: strings.reginsterVeteranBusiness, callback_data: botCommands.registerVeteranBusiness}]
    ]

    if(!unitRequestUnderReview && user == null)
        keyboardButtons.push([{text: strings.registerUnit, callback_data: botCommands.registerUnit}]);

    if(user != null) {
        if(!user.passedSignUp)
            keyboardButtons.push([{
                text: strings.unitShowOtp,
                callback_data: botCommands.managementQuery('user', user._id.toString(), botCommands.showOtp)}]);

        keyboardButtons.push([{
            text: strings.unitForgotPassword,
            callback_data: botCommands.managementQuery('user', user._id.toString(), botCommands.generateOtp)}]);
    }

    keyboardButtons.push([{text: strings.needMoreFunctionality, callback_data: botCommands.needMoreFunctionality}]);

    return keyboardButtons;
}

function getGreetingMessage(underReview: boolean, user: User|null): string {
    if(underReview)
        return strings.greetUnderReviewUser;

    return user == null
        ? strings.greetUnknownUser 
        : strings.greetKnownUser(user.email);
}

export async function validateRequestUser(body: any): Promise<boolean> {
    let user: TgUser | undefined = undefined;
    let chatId;
    let message = '';

    if(body.message) {
        user = body.message.from as TgUser;
        chatId = body.message.chat.id;
        message = body.message.text;
    } else if(body.callback_query) {
        user = body.callback_query.from as TgUser;
        chatId = body.callback_query.message.chat.id;
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

    return true;
}

export function sendMessage(responseMessage: BotTextResponse): Promise<fetch.Response> {
    return sendToBot('sendMessage', responseMessage);
}

export function sendPhoto(responseMessage: BotPhotoResponse): Promise<fetch.Response> {
    return sendToBot('sendPhoto', responseMessage);
}

export function deleteMessage(deleteMessage: BotDeleteMessageResponse): Promise<fetch.Response> {
    return sendToBot('deleteMessage', deleteMessage);
}

function sendToBot(endpoint: string, response: any): Promise<fetch.Response> {
    return fetch(`${TELEGRAM_API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
    });
}