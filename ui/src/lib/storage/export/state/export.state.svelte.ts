export interface ExportState {
	exporting: boolean;
}

const initialExportState: ExportState = {
	exporting: false
};

export const exportState = $state(initialExportState);

/**
 * Sets the `exporting` property
 */
export function exportState$$setExporting(exporting: boolean): void {
	exportState.exporting = exporting;
}
