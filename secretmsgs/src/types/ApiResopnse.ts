import { Message } from "@/Models/User"


export interface ApiResponse{
    success: boolean,
    message: string,
    isAcceptingMessages?: boolean,
    messages?:Array<Message>
}