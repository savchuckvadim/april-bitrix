import { TFieldItem } from '../../type/deal-field.type';

export interface DealValue {
    code: string;
    bitrixId: string;
    name: string;
    value: string | number | boolean | TFieldItem | TFieldItem[] | string[];
    listItem: TFieldItem | TFieldItem[];
}

export interface DealValueListItem {
    readonly name: string;
    readonly bitrixId: string | number;
    readonly sort?: string;
}

export class BxDealService {
    getComment(dealValues: DealValue[]) {
        const participants = this.getParticipants(dealValues);
        const info = this.getInfo(dealValues);
        let comment = `${info}\n`;
        for (const participant in participants) {
            comment += participants[participant] + '\n \n';
        }

        return comment;
    }
    getParticipants(dealValues: DealValue[]) {
        let participants = {} as Record<string, string>;
        dealValues.forEach((value, index) => {
            if (
                value.name.includes('Участник') &&
                value.value &&
                value.value !== '0'
            ) {
                for (let i = 1; i <= 11; i++) {
                    const key = `Участник ${i}`;
                    if (BxDealService.getIsNotEmptyParticipant(dealValues, i)) {
                        if (i === 1) {
                            if (
                                value.name.includes(key) &&
                                !value.name.includes('10') &&
                                value.value
                            ) {
                                if (!participants[i])
                                    participants[i] = '👤[B]' + key + '[/B] \n';
                                participants[i] +=
                                    '[B]' +
                                    value.name +
                                    ':[/B] ' +
                                    value.value +
                                    ' \n';
                            }
                        } else {
                            if (value.name.includes(key) && value.value) {
                                if (!participants[i])
                                    participants[i] = '👤[B]' + key + '[/B] \n';
                                participants[i] +=
                                    '[B]' +
                                    value.name +
                                    ':[/B] ' +
                                    value.value +
                                    ' \n';
                            }
                        }
                    }
                }
            }
        });
        return participants;
    }
    getInfo(dealValues: DealValue[]) {
        let info = '';
        dealValues.forEach(value => {
            if (!value.name.includes('Участник')) {
                if (value.value) {
                    if (!info) info = '💡[B]' + 'Информация' + '[/B] \n';
                    info += '[B]' + value.name + ':[/B] ' + value.value + ' \n';
                }
            }
        });
        return info;
    }
    public static getIsNotEmptyParticipant = (
        dealValues: DealValue[],
        participantIndex: number,
    ) => {
        let needPushParticipant = false;
        for (const value of dealValues) {
            if (
                value &&
                value.value &&
                value.code !== 'is_ppk' &&
                value.code !== 'format_v2' &&
                value.code !== 'format'
            ) {
                if (
                    value.name.includes(`Участник ${participantIndex}`) &&
                    ((participantIndex === 1 &&
                        !value.name.includes(`Участник 10`)) ||
                        (participantIndex === 10 &&
                            !value.name.includes(`Участник 1`)) ||
                        (participantIndex !== 1 && participantIndex !== 10))
                ) {
                    needPushParticipant = true;
                }
            }
        }
        return needPushParticipant;
    };
}
