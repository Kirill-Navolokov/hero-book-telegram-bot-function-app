import { BotResponse } from "./botResponse";

export default interface BotPhotoResponse extends BotResponse {
    photo: string;
    caption: string;
}