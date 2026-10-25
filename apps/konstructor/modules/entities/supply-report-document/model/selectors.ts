import type { SupplyReportState } from './SupplyReportSlice';

interface WithSupplyReport {
    supplyReport: SupplyReportState;
}

export const selectSupplyFormStatus = (state: WithSupplyReport) => state.supplyReport.formStatus;
export const selectSupplyItems = (state: WithSupplyReport) => state.supplyReport.items;
export const selectSupplyFiles = (state: WithSupplyReport) => state.supplyReport.files;
export const selectSupplyContacts = (state: WithSupplyReport) => state.supplyReport.contacts;
export const selectSupplyGenerate = (state: WithSupplyReport) => state.supplyReport.generate;
export const selectSupplyNeedProcess = (state: WithSupplyReport) => state.supplyReport.needProcess;
export const selectSupplyRpaId = (state: WithSupplyReport) => state.supplyReport.rpaId;
