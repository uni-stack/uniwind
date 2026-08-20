import '../remote-b.css'

import { Platform, StyleSheet, Text, View } from 'react-native'
import { useResolveClassNames, withUniwind } from 'uniwind'

const StyledView = withUniwind(View)

function formatObservedColor(value: unknown) {
    return typeof value === 'string' && value !== ''
        ? value
        : 'not registered'
}

function Signal({ className, label, testID }: { className: string; label: string; testID: string }) {
    const { backgroundColor } = useResolveClassNames(className)

    return (
        <View style={styles.signalRow}>
            <Text style={styles.signalLabel}>{label}</Text>
            <Text style={styles.observedLabel} testID={`${testID}-observed`}>
                Observed now: {formatObservedColor(backgroundColor)}
            </Text>
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
                    <Text style={styles.panelMeta}>Prefix rmb / blue (#2563eb) / port 8083</Text>
                </View>
            </View>
            <Text style={styles.moduleId}>remoteB/Panel</Text>
            <Signal
                className="mf-host-only"
                label="Host-shared mf-host-only: #16a34a"
                testID="remote-b-host-shared"
            />
            <Signal
                className="rmb:mf-remote-b-only"
                label="rmb:mf-remote-b-only: #2563eb"
                testID="remote-b-only"
            />
            <Signal
                className="rmb:mf-conflict"
                label="rmb:mf-conflict: #2563eb"
                testID="remote-b-conflict"
            />
            <Signal
                className="rmb:bg-mf-shared"
                label="--rmb-color-mf-shared: #2563eb"
                testID="remote-b-variable"
            />
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
    observedLabel: {
        color: '#172554',
        fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
        fontSize: 12,
        fontWeight: '700',
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
