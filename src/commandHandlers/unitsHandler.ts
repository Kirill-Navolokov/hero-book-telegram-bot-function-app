import { ObjectId } from "mongodb";
import { UnitRegistrationsRepository } from "../repositories/unitRegistrationsRepository";
import { mongoClient } from "../handler";
import { User } from "../models/user";
import { strings } from "../bot/strings";
import { botCommands } from "../bot/commands";
import { deleteMessage, sendMessage } from "../bot/botService";
import { TelegramAccountsRepository } from "../repositories/telegramAccountsRepository";
import { UnitRegistration } from "../models/unitRegistration";
import { UnitsRepository } from "../repositories/unitsRepository";


export async function handleUnitRegistration(
    user: User,
    chatId: number,
    registrationRequest: string
): Promise<void> {
    const unitsRepo = new UnitRegistrationsRepository(mongoClient.db(process.env.DB_NAME));
    if(await unitsRepo.requestFromUserExists(user.id)) {
        await sendMessage({
            chat_id: chatId,
            text: strings.unitRegistrationExists
        });
        return;
    }

    try {
        let unitRegistration = await verifyUnitRegistrationRequest(registrationRequest, chatId);
        if(unitRegistration == null)
            return;

        unitRegistration._id = new ObjectId();
        unitRegistration.userId = user.id;
        unitRegistration = await unitsRepo.add(unitRegistration!);
        const registrationId = unitRegistration._id!.toString();

        await sendMessage({
            chat_id: (process.env.HERO_BOOK_ADMIN_GROUP as unknown) as number,
            text: JSON.stringify(unitRegistration, undefined, '\n'),
            reply_markup: {
                inline_keyboard: [
                    [{text: strings.approve + ' ПІДРОЗДІЛ', callback_data: botCommands.approveQuery(registrationId, 'unit') }],
                    [{text: strings.reject + ' ПІДРОЗДІЛ', callback_data: botCommands.rejectQuery(registrationId, 'unit')}],
                    [{text: strings.ban, callback_data: botCommands.banQuery(registrationId, 'unit')}]
                ]
            }
        });

        await sendMessage({
            chat_id: chatId,
            text: strings.unitRegistrationAccepted
        });
    } catch(error) {
        await sendMessage({
            chat_id: chatId,
            text: strings.uknownErrorHappend
        });
    }
}

export async function handleUnitRegistrationResult(
    chatId: string,
    requestMessageId: number,
    callbackData: string,
    request: string
): Promise<void> {
    let registration = JSON.parse(request, (key, value) => {
        return key == "_id" ? new ObjectId(value as string) : value;
    }) as UnitRegistration;
    const db = mongoClient.db(process.env.DB_NAME);
    const unitRegistrationsRepo = new UnitRegistrationsRepository(db);
    registration = await unitRegistrationsRepo.get(registration._id!);
    let message;

    //CHANGE STATUS
    if(callbackData.includes('approve')) {
        // const unitsRepo = new UnitsRepository(db);
        // await unitsRepo.createUnitFromRequest(registration);

        //notify user
        message = 'Ваш підрозділ було зареєстровано. Тепер ви зможете його дозаповнити та опублікувати.';
        await unitRegistrationsRepo.delete(registration._id!);

        //notify admins
        await deleteMessage({chat_id: chatId, message_id: requestMessageId});
        await sendMessage({chat_id: chatId, text: 'ДОДАНО\n' + JSON.stringify(registration, undefined, '\n')});
    }
    else if (callbackData.includes('reject')) {
        await unitRegistrationsRepo.delete(registration._id!);
        await deleteMessage({chat_id: chatId, message_id: requestMessageId});
        await sendMessage({chat_id: chatId, text: 'ВІДХИЛЕНО\n' + JSON.stringify(registration, undefined, '\n')});
        message = 'Ваш запит на реєстрацію підрозділу було відхилено.';
    } else {
        await unitRegistrationsRepo.delete(registration._id!);
        //await sendMessage({chat_id: chatId, text: 'BANNED: ' + JSON.stringify(registration)});
        await deleteMessage({chat_id: chatId, message_id: requestMessageId});
        const tgAccountRepository = new TelegramAccountsRepository(db);
        await tgAccountRepository.add(registration.userId!);
    }

    // await unitRegistrationsRepo.delete(registration._id!);

    if(!callbackData.includes('ban')) {
        await sendMessage({
            chat_id: registration.chatId!,
            text: message!
        });
    }
}

async function verifyUnitRegistrationRequest(
    registrationRequest: string,
    chatId: number
): Promise<UnitRegistration|null> {
    try {
        const request = JSON.parse(registrationRequest) as UnitRegistration;
        request.chatId = chatId;
        return request;
    } catch(error) {
        await sendMessage({
            chat_id: chatId,
            text: JSON.stringify(error)
        });
        return null;
    }
}