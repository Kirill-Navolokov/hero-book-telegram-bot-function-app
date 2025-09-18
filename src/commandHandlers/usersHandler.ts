import { ObjectId } from "mongodb";
import { sendMessage } from "../bot/botService";
import { botCommands } from "../bot/commands";
import { strings } from "../bot/strings";
import { mongoClient } from "../handler";
import { UnitRegistration } from "../models/unitRegistration";
import { User } from "../models/user";
import { UsersRepository } from "../repositories/usersRepository";
import { RoleType } from "../models/roleType";

export async function handleUserManagement(
    chatId: any,
    userId: number,
    request: string
): Promise<void> {
    const usersRepo = new UsersRepository(mongoClient.db(process.env.DB_NAME));
    const user = await verifyUserExists(chatId, userId, usersRepo);
    if(user == null)
        return;

    let text: string;

    if(request.includes(botCommands.generateOtp)) {
        const newOtp = await usersRepo.generateNewOtp(user._id);
        text = strings.userNewOtpGenerated(newOtp);
    } else if(request.includes(botCommands.showOtp)) {
        const otp = await usersRepo.getOtp(user._id);
        text = otp == undefined ? strings.optNotExits : strings.userYourOtp(otp);
    } else {
        text = strings.unknownRequest(request);
    }

    await sendMessage({chat_id: chatId, text: text});
}

export function createUserFromUnitRequest(registration: UnitRegistration): Promise<User> {
    const usersRepo = new UsersRepository(mongoClient.db(process.env.DB_NAME));
    return usersRepo.create({
        _id: new ObjectId(),
        email: registration.adminEmail,
        tgUserId: registration.userId,
        passedSignUp: false,
        roles: [RoleType.UNIT]
    });
}

export function generateOtp(userId: ObjectId): Promise<string> {
    const usersRepo = new UsersRepository(mongoClient.db(process.env.DB_NAME));
    return usersRepo.generateNewOtp(userId);
}

export function getByEmail(email: string): Promise<User|null> {
    const usersRepo = new UsersRepository(mongoClient.db(process.env.DB_NAME));
    return usersRepo.getByEmail(email);
}

async function verifyUserExists(
    chatId: any,
    adminTgId: number,
    usersRepo: UsersRepository
): Promise<User | null> {
    const user = await usersRepo.getByTelegramId(adminTgId);
    if(user == null)
        await sendMessage({chat_id: chatId, text: strings.userNotReachable});
    
    return user;
}