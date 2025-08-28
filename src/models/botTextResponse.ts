import BotResponse from "./botResponse";

export default interface BotTextResponse extends BotResponse {
    callback_query_id?: string;
    text: string;
    reply_markup?: any,
}