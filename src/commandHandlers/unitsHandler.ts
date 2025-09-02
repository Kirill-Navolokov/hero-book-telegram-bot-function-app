import { ObjectId } from "mongodb";
import { UnitsRepository } from "../repositories/unitsRepository";
import { mongoClient } from "../handler";
import { User } from "../models/user";
import { strings } from "../bot/strings";
import { botCommands } from "../bot/commands";
import { sendMessage } from "../bot/botService";
import { url } from "inspector";


export async function handleUnitRegistration(
    user: User,
    chatId: number,
    registrationRequest: string
): Promise<void> {
    const unitsRepo = new UnitsRepository(mongoClient.db(process.env.DB_NAME));
    if(await unitsRepo.userRequestExists(user.id)) {
        await sendMessage({
            chat_id: chatId,
            text: strings.unitRegistrationExists
        });
        return;
    }

    try {
        const unitRegistration = await unitsRepo.addUnitRequest({
            _id: new ObjectId(),
            userId: user.id,
            userName: user.username!,
            chatId: chatId,
            request: registrationRequest
        });

        await sendMessage({
            chat_id: (process.env.HERO_BOOK_ADMIN_GROUP as unknown) as number,
            text: strings.unitRegistrationRequest(registrationRequest, user.username!),
            reply_markup: {
                inline_keyboard: [[
                    {text: strings.approve, callback_data: botCommands.approveQuery(unitRegistration._id, 'unit') },
                    {text: strings.reject, callback_data: botCommands.rejectQuery(unitRegistration._id, 'unit')},
                    {text: strings.ban, callback_data: botCommands.banQuery(unitRegistration._id, 'unit')}
                ]]
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
    const params = new URLSearchParams(request);
    const requestId = new ObjectId(params.get('requestId')!);
    // const unitsRepo = new UnitsRepository(mongoClient.db(process.env.DB_NAME));
    // const registration = await unitsRepo.getRequest(requestId);
    await sendMessage({chat_id: chatId, text: ` ${JSON.stringify(params)}        -         ${requestId}`});
    //CHANGE STATUS
    // if(request.includes('approve')) {
    //     await sendMessage({chat_id: chatId, text: 'APPROVED: ' + requestId});
    //     //ADD UNIT ITEM INTO TABLE
    // } else if (request.includes('reject')) {
    //     await sendMessage({chat_id: chatId, text: 'REJECTED: ' +requestId});
    // } else {
    //     await sendMessage({chat_id: chatId, text: 'BANNED: ' + requestId});
    //     //ADD TO BANNED USER 
    // }

    //SEND NOTIFICATION
    // await sendMessage({
    //     chat_id: registration.chatId,
    //     text: 'REQUEST STATUS CHANGED'
    // });
}