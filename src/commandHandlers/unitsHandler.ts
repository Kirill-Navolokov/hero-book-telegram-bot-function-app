import { ObjectId } from "mongodb";
import { UnitRegistrationsRepository } from "../repositories/unitRegistrationsRepository";
import { mongoClient } from "../handler";
import { User } from "../models/user";
import { strings } from "../bot/strings";
import { botCommands } from "../bot/commands";
import { sendMessage } from "../bot/botService";
import { TelegramAccountsRepository } from "../repositories/telegramAccountsRepository";
import { UnitRegistration } from "../models/unitRegistration";


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
        if(!unitRegistration)
            return;

        unitRegistration._id = new ObjectId();
        unitRegistration.userId = user.id;
        unitRegistration = await unitsRepo.add(unitRegistration!);
        const registrationId = unitRegistration._id!.toString();

        await sendMessage({
            chat_id: (process.env.HERO_BOOK_ADMIN_GROUP as unknown) as number,
            //text: strings.unitRegistrationRequest(registrationRequest, user.username!),
            text: JSON.stringify(unitRegistration),
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
    request: string
): Promise<void> {
    // const params = new URLSearchParams(request.split('?')[1]);
    // const requestId = new ObjectId(params.get('requestId')!);
    const unitReqistration = JSON.parse(request) as UnitRegistration;
    const db = mongoClient.db(process.env.DB_NAME);
    const unitsRepo = new UnitRegistrationsRepository(db);
    const registration = await unitsRepo.get(unitReqistration._id!);
    let message;

    //CHANGE STATUS
    if(request.includes('approve')) {
        await sendMessage({chat_id: chatId, text: 'APPROVED: ' + JSON.stringify(registration)});
        message = 'Ваш підрозділ було зареєстровано. Тепер ви зможете його дозаповнити та опублікувати.';
        //ADD UNIT ITEM INTO TABLE
        //await unitsRepo.createUnitFromRequest(registration);
    }
    else if (request.includes('reject')) {
        await sendMessage({chat_id: chatId, text: 'REJECTED: ' + JSON.stringify(registration)});
        message = 'Ваш запит на реєстрацію підрозділу було відхилено.';
    } else {
        await sendMessage({chat_id: chatId, text: 'BANNED: ' + JSON.stringify(registration)});
        // const tgAccountRepository = new TelegramAccountsRepository(db);
        // await tgAccountRepository.add(registration.userId!);
    }

    //await unitsRepo.delete(requestId);

    if(!request.includes('ban')) {
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
            text: strings.unitRegistrationWrongFormat
        });
        return null;
    }
}