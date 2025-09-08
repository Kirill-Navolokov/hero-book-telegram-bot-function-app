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
                    [{text: strings.approve + ' ПІДРОЗДІЛ', callback_data: botCommands.approveQuery('unit') }],
                    [{text: strings.reject + ' ПІДРОЗДІЛ', callback_data: botCommands.rejectQuery('unit')}],
                    [{text: strings.ban, callback_data: botCommands.banQuery('unit')}]
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
    let userMessage;
    let adminMessage;

    if(callbackData.includes('approve')) {
        const unitsRepo = new UnitsRepository(db);
        const newUnit = await unitsRepo.createUnitFromRequest(registration);

        userMessage = strings.unitApproved;
        adminMessage = `Підрозділ ${newUnit.name} створено`;
    }
    else if (callbackData.includes('reject')) {
        userMessage = strings.unitRejected;
        adminMessage = `Запит на підрозділ ${registration.name} віхилено`;
    } else {
        const tgAccountRepository = new TelegramAccountsRepository(db);
        await tgAccountRepository.add(registration.userId!);

        adminMessage = `Юзера ${registration.userId} з підрозділом ${registration.name} було забанено`;
    }

    await unitRegistrationsRepo.delete(registration._id!);
    await deleteMessage({chat_id: chatId, message_id: requestMessageId});

    if(!callbackData.includes('ban')) {
        await sendMessage({
            chat_id: registration.chatId!,
            text: userMessage!
        });
    }

    await sendMessage({chat_id: chatId, text: adminMessage});
}

export async function handleUnitManagement(
    chatId: any,
    userId: number,
    request: string): Promise<void> {

    if(request == '/management/unit') {
        await sendMessage({
            chat_id: chatId,
            text: strings.availableCommands,
            reply_markup: {
                inline_keyboard: getAdminManagementKeyboard(userId)
            }
        });
        return;
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

async function getAdminManagementKeyboard(
    adminUserId: number
): Promise<Array<Array<{text: string, callback_data: string}>>> {
    const unitsRepo = new UnitsRepository(mongoClient.db(process.env.DB_NAME));
    const unit = await unitsRepo.getUnitByAdminTgId(adminUserId);
    const isUnit = unit!.type == 0;
    const unitIdString = unit!._id.toString();
    const keyboard = [
        [{
            text: 'ЗМІНИТИ ФОТО',
            callback_data: botCommands.managementQuery('unit', unitIdString, botCommands.setPhoto)}
        ],
        [{
            text: 'ЗМІНИТИ НАЗВУ',
            callback_data: botCommands.managementQuery('unit', unitIdString, botCommands.setName)}
        ],
        [{
            text: 'ЗМІНИТИ ОПИС',
            callback_data: botCommands.managementQuery('unit', unitIdString, botCommands.setDescription)}
        ],
        [{
            text: 'ВСТАНОВИТИ ДАТУ ЗАСНУВАННЯ',
            callback_data: botCommands.managementQuery('unit', unitIdString, botCommands.setUnitFoundationDate)
        }],
        unit!.type == undefined
            ? [{
                    text: 'СТАТИ МІЛІТАРІ СПІЛЬНОТОЮ',
                    callback_data: botCommands.managementQuery('unit', unitIdString, botCommands.setUnitType(1))
                },
                {
                    text: 'СТАТИ ПІДРОЗДІЛОМ',
                    callback_data: botCommands.managementQuery('unit', unitIdString, botCommands.setUnitType(0))
                }]
            : [{
                    text: isUnit ? 'СТАТИ МІЛІТАРІ СПІЛЬНОТОЮ' : 'СТАТИ ПІДРОЗДІЛОМ',
                    callback_data: isUnit
                        ? botCommands.managementQuery('unit', unitIdString, botCommands.setUnitType(1))
                        : botCommands.managementQuery('unit', unitIdString, botCommands.setUnitType(0))
                }],
        [{
            text: unit!.isPublished ? 'ОПУБЛІКУВАТИ ПІДРОЗДІЛ': 'ПРИХОВАТИ ПІДРОЗДІЛ',
            callback_data: unit!.isPublished
                ? botCommands.managementQuery('unit', unitIdString, botCommands.unpublish)
                : botCommands.managementQuery('unit', unitIdString, botCommands.publish)
        }],
        [{
            text: 'ВИДАЛИТИ ПІДРОЗДІЛ',
            callback_data: botCommands.managementQuery('unit', unitIdString, botCommands.delete)
        }]
    ];

    // keyboard.push([{
    //     text: isUnit ? 'СТАТИ СПІЛЬНОТОЮ' : 'СТАТИ ПІДРОЗДІЛОМ',
    //     callback_data: isUnit
    //         ? botCommands.managementQuery('unit', unitIdString, botCommands.setUnitType(1))
    //         : botCommands.managementQuery('unit', unitIdString, botCommands.setUnitType(0))
    // }])

    // keyboard.push([{
    //     text: unit!.isPublished ? 'ВІДКРИТИ ПІДРОЗДІЛ': 'ЗАКРИТИ ПІДРОЗДІЛ',
    //     callback_data: unit!.isPublished
    //         ? botCommands.managementQuery('unit', unitIdString, botCommands.unpublish)
    //         : botCommands.managementQuery('unit', unitIdString, botCommands.publish)
    // }]);

    return keyboard;
}