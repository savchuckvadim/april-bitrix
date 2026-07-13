import type { PbxProcessAdapter } from '../../../../process';
import { findProcessRecord } from '../../../../process';
import {
    RPA_NAMES,
    TYPED_GROUPS,
    type RpaName,
    type TypedGroup,
} from '../../../../lib/model/common';
import { RpaProcessHelper } from './rpa-process-helper';

const helper = new RpaProcessHelper();

/** `PbxProcessAdapter` for `PBX RPA Install` (whole-RPA orchestration). */
export const rpaProcessAdapter: PbxProcessAdapter = {
    key: 'rpa',
    label: 'RPA-процессы',
    itemLabel: 'RPA',
    variantOptions: RPA_NAMES,
    groupOptions: TYPED_GROUPS,
    getMonitoring: (domain) => helper.getRpas(domain),
    findInstalled: (monitoring, code) => findProcessRecord(monitoring, code),
    install: (domain, code, group) =>
        helper.installRpa(domain, code as RpaName, group as TypedGroup),
    remove: (domain, code, _group, withBitrix) =>
        helper.deleteRpa(domain, code as RpaName, withBitrix),
};
