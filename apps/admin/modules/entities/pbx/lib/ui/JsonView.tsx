'use client';

/**
 * Read-only pretty-printer for monitoring responses whose shape the pbx-install
 * backend doesn't yet declare in OpenAPI (typed `void`/`unknown`). Lets the
 * admin inspect merged state until typed DTOs land.
 */
export function JsonView({ data }: { data: unknown }) {
    return (
        <pre className="max-h-[480px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
            {data === undefined
                ? '—'
                : JSON.stringify(data, null, 2)}
        </pre>
    );
}
