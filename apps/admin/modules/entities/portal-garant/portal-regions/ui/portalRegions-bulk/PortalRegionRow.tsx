'use client';

import { Checkbox } from '@workspace/ui/components/checkbox';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import type { PortalRegionsDraft } from '../../lib/hooks/use-portalRegions-bulk';
import { withoutRegion } from '../../lib/region-view.util';
import type { PortalRegion } from '../../model';
import { PortalRegionOwnPriceCell } from './PortalRegionOwnPriceCell';

interface PortalRegionRowProps {
    region: PortalRegion;
    draft: PortalRegionsDraft;
}

/** Строка региона: галочка, общий рабс, своя цена и итоговый рабс портала */
export function PortalRegionRow({ region, draft }: PortalRegionRowProps) {
    const regionId = Number(region.id);
    const row = draft.rowState(regionId);

    return (
        <TableRow className={row.isPending ? 'bg-muted/40' : undefined}>
            <TableCell>
                <Checkbox
                    checked={row.enabled}
                    onCheckedChange={checked =>
                        draft.toggle(regionId, checked === true)
                    }
                    aria-label={`Регион ${region.title}`}
                />
            </TableCell>
            <TableCell className="font-medium">{region.title}</TableCell>
            <TableCell className="font-mono text-xs">{region.code}</TableCell>
            <TableCell>{region.abs}</TableCell>
            <TableCell>
                <PortalRegionOwnPriceCell
                    regionTitle={region.title}
                    view={row.view}
                    options={withoutRegion(draft.sourceOptions, regionId)}
                    disabled={!row.enabled}
                    isInvalid={row.isAbsInvalid}
                    onSourceChange={value =>
                        draft.setOwnSource(regionId, Number(value))
                    }
                    onAbsChange={value => draft.setOwnAbsInput(regionId, value)}
                    onReset={() => draft.resetOwnPrice(regionId)}
                />
            </TableCell>
            <TableCell className="font-medium">{row.effectiveAbs}</TableCell>
        </TableRow>
    );
}
