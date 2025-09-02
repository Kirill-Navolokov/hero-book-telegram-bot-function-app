import { ObjectId } from "mongodb";
import { UnitsRepository } from "../repositories/unitsRepository";
import { mongoClient } from "../handler";
import { User } from "../models/user";
import { strings } from "../bot/strings";
import { botCommands } from "../bot/commands";
import { sendMessage } from "../bot/botService";


export async function handleUnitRegistration(
    user: User,
    chatId: number,
    registrationReequest: string
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
            request: registrationReequest
        });

        await sendMessage({
            chat_id: (process.env.HERO_BOOK_ADMIN_GROUP as unknown) as number,
            text: strings.unitRegistrationRequest(registrationReequest, user.username!),
            reply_markup: {
                inline_keyboard: [[
                    {text: strings.approve, callback_data: botCommands.approveQuery(unitRegistration._id, 'unit') },
                    {text: strings.reject, callback_data: botCommands.rejectQuery(unitRegistration._id, 'unit')},
                    {text: strings.ban, callback_data: botCommands.banQuery(user.id)}
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

export async function handleUnitRegistrationResult(): Promise<void> {

}