import fetch from "node-fetch";
import BotPhotoResponse from "../models/botPhotoResponse";
import BotTextResponse from "../models/botTextResponse";
import BotResponse from "../models/botResponse";

const TOKEN = process.env.TELEGRAM_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

export async function sendMessage(responseMessage: BotTextResponse): Promise<fetch.Response> {
    return await sendToBot(responseMessage);
    // return await fetch(`${TELEGRAM_API}/sendMessage`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(responseMessage),
    // });
}

export async function sendPhoto(responseMessage: BotPhotoResponse): Promise<fetch.Response> {
    return await sendToBot(responseMessage);
    // return await fetch(`${TELEGRAM_API}/sendPhoto`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(responseMessage),
    // });
}

async function sendToBot(response: BotResponse): Promise<fetch.Response> {
    return fetch(`${TELEGRAM_API}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
    });
}