import { BotResponse } from "./botResponse";
import InlineKeyboardMarkup from "./inlineKeyboardMarkup";

export default interface BotTextResponse extends BotResponse {
    callback_query_id?: string;
    text: string;
    reply_markup?: InlineKeyboardMarkup,
}