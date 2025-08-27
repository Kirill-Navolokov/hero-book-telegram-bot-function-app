export default interface BotResponseMessage {
    chat_id: string;
    text: string;
    reply_markup?: InlineKeyboardMarkup
}

export interface InlineKeyboardMarkup {
    inline_keyboard: Array<Array<InlineKeyboardButton>> 
}

export interface InlineKeyboardButton {
    text: string;
    callback_data?: string;
}