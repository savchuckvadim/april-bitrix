import { IBXUser } from "../../domain/interfaces/bitrix.interface";

export interface BXInitializedDto {
    domain: string;
    user: IBXUser;
    inFrame: boolean;
    initialized: boolean;
}
