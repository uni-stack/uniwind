import '../remote-a.css'

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

export default function RemotePanel({ revision }: { revision: string }) {
    return (
        <View style={styles.panel}>
            <View style={styles.panelHeading}>
                <View style={[styles.ownerDot, styles.remoteDot]} />
                <View>
                    <Text style={styles.panelTitle}>Remote A</Text>
                    <Text style={styles.panelMeta}>Declares yellow (#facc15) on port 8082</Text>
                </View>
            </View>
            <Text style={styles.moduleId}>remoteA/Panel</Text>
            <Signal
                key={`remote-a-only-${revision}`}
                className="mf-remote-a-only"
                label="Remote A-only class declares: #facc15"
                testID="remote-a-only"
            />
            <Signal
                key={`remote-a-conflict-${revision}`}
                className="mf-conflict"
                label="Shared class declares: #facc15"
                testID="remote-a-conflict"
            />
            <Signal
                key={`remote-a-variable-${revision}`}
                className="mf-variable-probe"
                label="--mf-shared-color declares: #facc15"
                testID="remote-a-variable"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    panel: {
        backgroundColor: '#fefce8',
        borderColor: '#fde047',
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
        backgroundColor: '#facc15',
    },
    panelTitle: {
        color: '#422006',
        fontSize: 19,
        fontWeight: '800',
    },
    panelMeta: {
        color: '#854d0e',
        fontSize: 12,
    },
    moduleId: {
        color: '#713f12',
        fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
        fontSize: 12,
    },
    signalRow: {
        gap: 6,
    },
    signalLabel: {
        color: '#713f12',
        fontSize: 13,
        fontWeight: '600',
    },
    observedLabel: {
        color: '#422006',
        fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
        fontSize: 12,
        fontWeight: '700',
    },
    signalTrack: {
        backgroundColor: '#fef9c3',
        borderColor: '#fde047',
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
