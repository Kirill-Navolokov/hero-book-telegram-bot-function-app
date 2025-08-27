import InlineKeyboardMarkup from "./inlineKeyboardMarkup";

export default interface BotResponseMessage {
    chat_id: string;
    text: string;
    reply_markup?: InlineKeyboardMarkup
}