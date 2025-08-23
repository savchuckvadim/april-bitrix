import { EnumTelegramApp, ITelegramBotDto, TelegramSendMessageDto } from "../type/telegram.type"


export const telegramSendMessage = async (dto: ITelegramBotDto) => {
    try {


        const sendDto: TelegramSendMessageDto = {
            app: EnumTelegramApp.KPI_SALES,
            text: dto.text,
            domain: dto.domain,
            userId: dto.userId
        }
        const response = await fetch(`/api/telegram`, {
            method: 'POST',
            body: JSON.stringify(sendDto)
        })
        return response.json()
    } catch (error) {
        console.error(error)
    }
}