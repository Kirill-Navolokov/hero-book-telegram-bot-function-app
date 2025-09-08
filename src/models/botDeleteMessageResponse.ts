import BotResponse from "./botResponse";

export default interface BotDeleteMessageResponse extends BotResponse {
    message_id: number;
}