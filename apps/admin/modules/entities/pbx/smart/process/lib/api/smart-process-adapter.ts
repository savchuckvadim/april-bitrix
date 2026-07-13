import type { PbxProcessAdapter } from '../../../../process';
import { findProcessRecord } from '../../../../process';
import {
    SMART_NAMES,
    TYPED_GROUPS,
    type SmartName,
    type TypedGroup,
} from '../../../../lib/model/common';
import { SmartProcessHelper } from './smart-process-helper';

const helper = new SmartProcessHelper();

/** `PbxProcessAdapter` for `PBX Smart Install` (whole-smart orchestration). */
export const smartProcessAdapter: PbxProcessAdapter = {
    key: 'smart',
    label: 'Смарт-процессы',
    itemLabel: 'Смарт',
    variantOptions: SMART_NAMES,
    groupOptions: TYPED_GROUPS,
    getMonitoring: (domain) => helper.getSmarts(domain),
    findInstalled: (monitoring, code) => findProcessRecord(monitoring, code),
    install: (domain, code, group) =>
        helper.installSmart(domain, code as SmartName, group as TypedGroup),
    remove: (domain, code, group, withBitrix) =>
        helper.deleteSmart(domain, code as SmartName, group as TypedGroup, withBitrix),
};
