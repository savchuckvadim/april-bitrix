/**
 * PDF-версия предложения: сухая таблица стоимости, итог, условия.
 *
 * Данные приходят готовыми из renewal-pdf.rows (та же модель, что у
 * страницы), поэтому здесь только вёрстка.
 */
import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { buildTerms } from '../../model/renewal-offer.content';
import type { RenewalOffer } from '../../model/renewal-offer.model';
import { RENEWAL_PDF_FONT } from './renewal-pdf.fonts';
import {
    buildRenewalPdfDevNote,
    buildRenewalPdfRows,
    type RenewalPdfRow,
} from './renewal-pdf.rows';
import { RENEWAL_PDF_THEME } from './renewal-pdf.theme';

const { colors, sizes, page } = RENEWAL_PDF_THEME;

const styles = StyleSheet.create({
    page: {
        fontFamily: RENEWAL_PDF_FONT,
        fontSize: sizes.base,
        color: colors.text,
        backgroundColor: '#FFFFFF',
        paddingTop: page.paddingTop,
        paddingBottom: page.paddingBottom,
        paddingHorizontal: page.paddingHorizontal,
        lineHeight: 1.4,
    },
    eyebrow: {
        fontSize: sizes.sm,
        color: colors.muted,
        letterSpacing: 0.6,
    },
    h1: { fontSize: sizes.h1, fontWeight: 'bold', marginTop: 6 },
    lead: {
        fontSize: sizes.base,
        color: colors.muted,
        marginTop: 8,
        maxWidth: 400,
    },
    h2: {
        fontSize: sizes.h2,
        fontWeight: 'bold',
        marginTop: 22,
        marginBottom: 6,
    },
    table: { borderTopWidth: 0.75, borderTopColor: colors.line },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.line,
        paddingVertical: 7,
    },
    cellName: { width: '66%', paddingRight: 10 },
    cellPrice: { width: '34%', alignItems: 'flex-end' },
    name: { fontSize: sizes.base, fontWeight: 'bold' },
    note: { fontSize: sizes.xs, color: colors.muted, marginTop: 2 },
    price: { fontSize: sizes.lg, fontWeight: 'bold' },
    period: { fontSize: sizes.xs, color: colors.muted },
    totalBox: {
        marginTop: 14,
        backgroundColor: colors.shade,
        borderWidth: 0.75,
        borderColor: colors.line,
        borderRadius: 3,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    totalLabel: { fontSize: sizes.base, fontWeight: 'bold' },
    totalNote: { fontSize: sizes.xs, color: colors.muted, marginTop: 3 },
    totalValue: {
        fontSize: sizes.total,
        fontWeight: 'bold',
        color: colors.total,
    },
    term: { fontSize: sizes.sm, color: colors.muted, marginBottom: 3 },
    footnote: {
        fontSize: sizes.xs,
        color: colors.muted,
        marginTop: 18,
    },
    footer: {
        position: 'absolute',
        bottom: page.edge,
        left: page.paddingHorizontal,
        right: page.paddingHorizontal,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 0.5,
        borderTopColor: colors.line,
        paddingTop: 6,
    },
    footerText: { fontSize: sizes.xs, color: colors.muted },
});

const PriceRow: React.FC<{ row: RenewalPdfRow }> = ({ row }) => (
    <View style={styles.row} wrap={false}>
        <View style={styles.cellName}>
            <Text style={styles.name}>{row.title}</Text>
            {row.note ? <Text style={styles.note}>{row.note}</Text> : null}
        </View>
        <View style={styles.cellPrice}>
            <Text style={styles.price}>{row.price}</Text>
            <Text style={styles.period}>{row.period}</Text>
        </View>
    </View>
);

export interface RenewalPdfDocumentProps {
    readonly offer: RenewalOffer;
}

/** Документ предложения на следующий год. */
export const RenewalPdfDocument: React.FC<RenewalPdfDocumentProps> = ({
    offer,
}) => {
    const rows = buildRenewalPdfRows(offer);
    const devNote = buildRenewalPdfDevNote(offer);
    const terms = buildTerms(offer);
    const title = offer.clientName
        ? `Условия обслуживания для «${offer.clientName}»`
        : 'Условия обслуживания';

    return (
        <Document
            title={`Коммерческое предложение — ${
                offer.clientName || 'условия обслуживания'
            }`}
            author="Апрель"
            creator="April"
            producer="April"
            language="ru"
        >
            <Page size="A4" style={styles.page}>
                <Text style={styles.eyebrow}>
                    КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ НА СЛЕДУЮЩИЙ ГОД
                </Text>
                <Text style={styles.h1}>{title}</Text>
                <Text style={styles.lead}>
                    Состав услуг и стоимость на следующий год. Всё, чем вы
                    пользуетесь сейчас, продолжает работать — ниже зафиксированы
                    цены и условия.
                </Text>

                <Text style={styles.h2}>Стоимость</Text>
                <View style={styles.table}>
                    {rows.monthly.map((row) => (
                        <PriceRow key={row.title} row={row} />
                    ))}
                </View>

                <View style={styles.totalBox} wrap={false}>
                    <View>
                        <Text style={styles.totalLabel}>Ежемесячный платёж</Text>
                        {rows.adjustment ? (
                            <Text style={styles.totalNote}>
                                {rows.adjustment.label}: {rows.adjustment.value}{' '}
                                в месяц — уже учтено в сумме.
                            </Text>
                        ) : null}
                        <Text style={styles.totalNote}>
                            Стоимость зафиксирована на 12 месяцев с момента
                            продления.
                        </Text>
                    </View>
                    <Text style={styles.totalValue}>{rows.monthlyTotal}</Text>
                </View>

                {rows.once.length > 0 ? (
                    <>
                        <Text style={styles.h2}>Разовые услуги</Text>
                        <View style={styles.table}>
                            {rows.once.map((row) => (
                                <PriceRow key={row.title} row={row} />
                            ))}
                        </View>
                        {rows.onceTotal ? (
                            <Text style={styles.totalNote}>
                                Итого разово: {rows.onceTotal} — оплачивается
                                отдельно от ежемесячного платежа.
                            </Text>
                        ) : null}
                    </>
                ) : null}

                <Text style={styles.h2}>Условия</Text>
                {terms.map((term) => (
                    <Text key={term} style={styles.term}>
                        — {term}
                    </Text>
                ))}

                <Text style={styles.footnote}>
                    {devNote ? `${devNote} ` : ''}
                    Предложение носит информационный характер и не является
                    публичной офертой.
                </Text>

                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        {offer.clientName || 'Коммерческое предложение'}
                    </Text>
                    <Text
                        style={styles.footerText}
                        render={({ pageNumber, totalPages }) =>
                            `${pageNumber} / ${totalPages}`
                        }
                    />
                </View>
            </Page>
        </Document>
    );
};
