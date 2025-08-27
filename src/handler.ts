import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import fetch from "node-fetch";
import BotResponseMessage from "./models/botResponseMessage";

const TOKEN = process.env.TELEGRAM_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessage(responseMessage: BotResponseMessage): Promise<fetch.Response> {
   return await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(responseMessage),
  });
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return { statusCode: 400, body: "No body" };
  }

  const body = JSON.parse(event.body);

  if (body.message) {
    const chatId = body.message.chat.id;
    const text = body.message.text || "";

    if (text === "/start") {
        let userName = body.message.from.username;
        if(knowsUsers.has(userName)) {
            await greetKnownUser(chatId, userName);
        } else {
            await sendMessage({
                chat_id: chatId,
                text: "Схоже, ми ще не знайомі. Я бот Книги Героїв, допомагаю по дрібницях. Чим можу вам допомогти?"
            });
        }
    } else {
      await sendMessage(
        {
            chat_id: chatId,
            text: body.message.text != "" ?`You said: ${text}`
                : body.callback_query.data
        });
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

const knowsUsers = new Set(["kyrylo_navolokov"]);

async function greetKnownUser(chatId: string, userName: string): Promise<fetch.Response> {
    let responseMessage: BotResponseMessage = {
        chat_id: chatId,
        text: "Привіт, " + userName + ", чим можу бути корисний",
        reply_markup: {
            inline_keyboard: [[
                { text: 'Зараєструвати бізнес', callback_data: 'register_business' },
                { text: 'Зараєструвати підрозділ', callback_data: 'register_unit' }
            ]]
        }
    }

    return await sendMessage(responseMessage);
}