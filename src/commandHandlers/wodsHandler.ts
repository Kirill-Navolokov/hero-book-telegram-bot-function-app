import fetch from "node-fetch";
import { mongoClient } from "../handler";
import { WodsRepository } from "../repositories/wodsRepository";
import { sendPhoto } from "../bot/botService";
import { strings } from "../bot/strings";

export async function sendRandomWod(chatId: string) : Promise<fetch.Response> {
    const wodsRepo = new WodsRepository(mongoClient.db(process.env.DB_NAME));
    const wod = await wodsRepo.getRandomWod();

    return await sendPhoto({
        chat_id: chatId,
        photo: wod.imageUrl,
        caption: strings.wodMessageTemplate(wod.name, wod.executionDate, wod.scheme)
    });
}