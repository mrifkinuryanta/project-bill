import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from "@react-pdf/renderer";

// Register fonts if needed (we'll stick to standard Helvetica for simplicity if no custom font is provided)
// Alternatively, we can use default fonts which is safer for serverless.

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Helvetica",
        fontSize: 11,
        color: "#334155", // slate-700
        lineHeight: 1.5,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0", // slate-200
        paddingBottom: 20,
        marginBottom: 30,
    },
    titleContainer: {
        flexDirection: "column",
    },
    title: {
        fontSize: 24,
        fontFamily: "Helvetica-Bold",
        color: "#0f172a", // slate-900
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: "#64748b", // slate-500
    },
    metaInfo: {
        flexDirection: "column",
        alignItems: "flex-end",
    },
    metaLabel: {
        fontSize: 10,
        color: "#94a3b8", // slate-400
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#475569", // slate-600
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
        color: "#0f172a",
        marginTop: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        paddingBottom: 4,
    },
    content: {
        marginBottom: 20,
    },
    paragraph: {
        marginBottom: 10,
        textAlign: "justify",
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
    },
    auditTrailContainer: {
        marginTop: 40,
        paddingTop: 15,
        borderTopWidth: 2,
        borderTopColor: "#10b981", // emerald-500
        backgroundColor: "#f0fdf4", // emerald-50
        padding: 15,
        borderRadius: 4,
    },
    auditTitle: {
        fontFamily: "Helvetica-Bold",
        color: "#047857", // emerald-700
        fontSize: 12,
        marginBottom: 8,
    },
    auditRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    auditLabel: {
        width: 100,
        fontFamily: "Helvetica-Bold",
        color: "#065f46", // emerald-800
        fontSize: 9,
    },
    auditValue: {
        flex: 1,
        color: "#047857", // emerald-700
        fontSize: 9,
    },
    pageNumber: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: "center",
        color: "#94a3b8",
        fontSize: 9,
    },
});

interface SOWDocumentProps {
    projectTitle: string;
    clientName: string;
    terms: string;
    termsAcceptedAt: Date | null;
    termsAcceptedIp: string | null;
    termsVersionId: string | null;
}

export const SOWDocument = ({
    projectTitle,
    clientName,
    terms,
    termsAcceptedAt,
    termsAcceptedIp,
    termsVersionId,
}: SOWDocumentProps) => {
    // Simple crude parser for newlines to create distinct text blocks
    const paragraphs = terms.split("\n\n").map((p) => p.trim()).filter(Boolean);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Statement of Work</Text>
                        <Text style={styles.subtitle}>{projectTitle}</Text>
                    </View>
                    <View style={styles.metaInfo}>
                        <Text style={styles.metaLabel}>Client</Text>
                        <Text style={styles.metaValue}>{clientName}</Text>
                        <Text style={[styles.metaLabel, { marginTop: 8 }]}>Generated Date</Text>
                        <Text style={styles.metaValue}>{new Date().toLocaleDateString()}</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Agreement Terms</Text>
                    {paragraphs.map((paragraph, index) => (
                        <Text key={index} style={styles.paragraph}>
                            {paragraph}
                        </Text>
                    ))}
                </View>

                {termsAcceptedAt && (
                    <View style={styles.auditTrailContainer}>
                        <Text style={styles.auditTitle}>Electronic Signature - Audit Trail</Text>

                        <View style={styles.auditRow}>
                            <Text style={styles.auditLabel}>Accepted By:</Text>
                            <Text style={styles.auditValue}>{clientName}</Text>
                        </View>

                        <View style={styles.auditRow}>
                            <Text style={styles.auditLabel}>Timestamp (UTC):</Text>
                            <Text style={styles.auditValue}>
                                {new Date(termsAcceptedAt).toUTCString()}
                            </Text>
                        </View>

                        <View style={styles.auditRow}>
                            <Text style={styles.auditLabel}>IP Address:</Text>
                            <Text style={styles.auditValue}>{termsAcceptedIp || "Unknown"}</Text>
                        </View>

                        <View style={styles.auditRow}>
                            <Text style={styles.auditLabel}>Document Version:</Text>
                            <Text style={styles.auditValue}>{termsVersionId || "Unknown"}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.footer} fixed>
                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                        `Page ${pageNumber} of ${totalPages}`
                    )} />
                </View>
            </Page>
        </Document>
    );
};
