import '../remote-b.css'

import { Platform, StyleSheet, Text, View } from 'react-native'
import { withUniwind } from 'uniwind'

const StyledView = withUniwind(View)

function Signal({ className, label, testID }: { className: string; label: string; testID: string }) {
    return (
        <View style={styles.signalRow}>
            <Text style={styles.signalLabel}>{label}</Text>
            <View style={styles.signalTrack}>
                <StyledView className={className} style={styles.signalBar} testID={testID} />
            </View>
        </View>
    )
}

export default function RemotePanel() {
    return (
        <View style={styles.panel}>
            <View style={styles.panelHeading}>
                <View style={[styles.ownerDot, styles.remoteDot]} />
                <View>
                    <Text style={styles.panelTitle}>Remote B</Text>
                    <Text style={styles.panelMeta}>Declares blue (#2563eb) on port 8083</Text>
                </View>
            </View>
            <Text style={styles.moduleId}>remoteB/Panel</Text>
            <Signal className="mf-remote-b-only" label="Remote B-only class: #2563eb" testID="remote-b-only" />
            <Signal className="mf-conflict" label="Shared class declares: #2563eb" testID="remote-b-conflict" />
            <Signal className="mf-variable-probe" label="--mf-shared-color: #2563eb" testID="remote-b-variable" />
        </View>
    )
}

const styles = StyleSheet.create({
    panel: {
        backgroundColor: '#eff6ff',
        borderColor: '#93c5fd',
        borderRadius: 8,
        borderWidth: 1,
        gap: 14,
        maxWidth: 760,
        padding: 18,
    },
    panelHeading: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    ownerDot: {
        borderRadius: 10,
        height: 12,
        width: 12,
    },
    remoteDot: {
        backgroundColor: '#2563eb',
    },
    panelTitle: {
        color: '#172554',
        fontSize: 19,
        fontWeight: '800',
    },
    panelMeta: {
        color: '#1e40af',
        fontSize: 12,
    },
    moduleId: {
        color: '#1e3a8a',
        fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
        fontSize: 12,
    },
    signalRow: {
        gap: 6,
    },
    signalLabel: {
        color: '#1e3a8a',
        fontSize: 13,
        fontWeight: '600',
    },
    signalTrack: {
        backgroundColor: '#dbeafe',
        borderColor: '#93c5fd',
        borderRadius: 4,
        borderWidth: 1,
        height: 34,
        overflow: 'hidden',
    },
    signalBar: {
        height: '100%',
        width: '100%',
    },
})
