import fetch from "node-fetch";
import BotPhotoResponse from "../models/botPhotoResponse";
import BotTextResponse from "../models/botTextResponse";
import { User } from "../models/user";
import { TelegramAccountsRepository } from "../repositories/telegramAccountsRepository";
import { mongoClient } from "../handler";
import { strings } from "./strings";
import { botCommands } from "./commands";
import BotDeleteMessageResponse from "../models/botDeleteMessageResponse";
import { UnitRegistrationsRepository } from "../repositories/unitRegistrationsRepository";
import { UnitsRepository } from "../repositories/unitsRepository";
import { Unit } from "../models/unit";

const TOKEN = process.env.TELEGRAM_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

export async function greetUser(chatId: string, userId: number): Promise<fetch.Response> {
    const unitRegistrationsRepo = new UnitRegistrationsRepository(mongoClient.db(process.env.DB_NAME));
    const unitRequestUnderReview = await unitRegistrationsRepo.requestFromUserExists(userId);
    let unit: Unit|null = null;

    if(!unitRequestUnderReview) {
        const unitsRepo = new UnitsRepository(mongoClient.db(process.env.DB_NAME));
        unit = await unitsRepo.getUnitByAdminTgId(userId);
    }

    let responseMessage: BotTextResponse = {
        chat_id: chatId,
        text: getGreetingMessage(unitRequestUnderReview, unit),
        reply_markup: {
            inline_keyboard: getStartInlineKeyboard(unitRequestUnderReview, unit)
        }
    }

    return await sendMessage(responseMessage);
}

function getStartInlineKeyboard(
    unitRequestUnderReview: boolean,
    unit: Unit|null
) : Array<Array<{text: string; callback_data: string}>> {
    const keyboardButtons = [
        [{text: strings.getRandomWod, callback_data: botCommands.randomWod}],
        //[{text: strings.reginsterVeteranBusiness, callback_data: botCommands.registerVeteranBusiness}]
    ]

    if(!unitRequestUnderReview && unit == null)
        keyboardButtons.push([{text: strings.registerUnit, callback_data: botCommands.registerUnit}]);

    if(unit != null) {
        const text = unit.passedSignUp
            ? strings.unitForgotPassword
            : strings.unitShowOtp;
        const action = unit.passedSignUp
            ? botCommands.generateOtp
            : botCommands.showOtp;

        keyboardButtons.push([{
            text: text,
            callback_data: botCommands.managementQuery('unit', unit._id.toString(), action)}]);
    }

    keyboardButtons.push([{text: strings.needMoreFunctionality, callback_data: botCommands.needMoreFunctionality}]);

    return keyboardButtons;
}

function getGreetingMessage(underReview: boolean, unit: Unit|null): string {
    if(underReview)
        return strings.greetUnderReviewUser;

    return unit == null
        ? strings.greetUnknownUser 
        : strings.greetKnownUser(unit.name);
}

export async function validateRequestUser(body: any): Promise<boolean> {
    let user: User | undefined = undefined;
    let chatId;
    let message = '';

    if(body.message) {
        user = body.message.from as User;
        chatId = body.message.chat.id;
        message = body.message.text;
    } else if(body.callback_query) {
        user = body.callback_query.from as User;
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