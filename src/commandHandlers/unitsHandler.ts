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
import { Unit } from "../models/unit";

export async function handleUnitRegistration(
    user: User,
    chatId: number,
    registrationRequest: string
): Promise<void> {
    const unitRegistrationsRepo = new UnitRegistrationsRepository(mongoClient.db(process.env.DB_NAME));
    if(await unitRegistrationsRepo.requestFromUserExists(user.id)) {
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

        const unitsRepo = new UnitsRepository(mongoClient.db(process.env.DB_NAME));
        const unit = await unitsRepo.getUnitByAdminEmail(unitRegistration.adminEmail);
        const existingRequest = await unitRegistrationsRepo.getRequestByAdminEmail(unitRegistration.adminEmail);
        if(unit != null || existingRequest != null) {
            await sendMessage({chat_id: chatId, text: strings.emailAlreadyInUse(unitRegistration.adminEmail)});
            return;
        }


        unitRegistration._id = new ObjectId();
        unitRegistration.userId = user.id;
        unitRegistration = await unitRegistrationsRepo.add(unitRegistration!);
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

        userMessage = strings.unitApproved(newUnit.otp);
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
    request: string
): Promise<void> {
    const unitsRepo = new UnitsRepository(mongoClient.db(process.env.DB_NAME));
    const unit = await verifyUnitExists(chatId, userId, unitsRepo);
    if(unit == null)
        return;

    let text: string;

    if(request.includes(botCommands.generateOtp)) {
        const newOtp = await unitsRepo.generateNewOtp(unit._id);
        text = strings.unitNewOtpGenerated(newOtp);
    } else if(request.includes(botCommands.showOtp)) {
        const otp = await unitsRepo.getOtp(unit._id);
        text = strings.unitYourOtp(otp);
    } else {
        text = strings.unknownRequest(request);
    }

    await sendMessage({chat_id: chatId, text: text});
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

async function verifyUnitExists(
    chatId: any,
    adminTgId: number,
    unitsRepo: UnitsRepository
): Promise<Unit | null> {
    const unit = await unitsRepo.getUnitByAdminTgId(adminTgId);
    if(unit == null)
        await sendMessage({chat_id: chatId, text: strings.unitNotReachable});
    
    return unit;
}