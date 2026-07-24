import '../host.css'

import { Component, lazy, Suspense, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    DevSettings,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { withUniwind } from 'uniwind'

const RemoteA = lazy(() => import('remoteA/Panel'))
const RemoteB = lazy(() => import('remoteB/Panel'))
const StyledView = withUniwind(View)

type RemoteId = 'A' | 'B'

type RemoteErrorBoundaryProps = {
    children: React.ReactNode
    name: string
}

type RemoteErrorBoundaryState = {
    error: Error | null
}

class RemoteErrorBoundary extends Component<RemoteErrorBoundaryProps, RemoteErrorBoundaryState> {
    state: RemoteErrorBoundaryState = {
        error: null,
    }

    static getDerivedStateFromError(error: Error) {
        return { error }
    }

    render() {
        if (this.state.error) {
            return (
                <View style={styles.errorPanel}>
                    <Text style={styles.errorTitle}>{this.props.name} failed to load</Text>
                    <Text style={styles.errorText}>{this.state.error.message}</Text>
                    <Text style={styles.errorText}>Use Reload runtime before trying again.</Text>
                </View>
            )
        }

        return this.props.children
    }
}

type ReadyBoundaryProps = {
    children: React.ReactNode
    id: RemoteId
    onReady: (id: RemoteId) => void
}

function ReadyBoundary({ children, id, onReady }: ReadyBoundaryProps) {
    useEffect(() => {
        onReady(id)
    }, [id, onReady])

    return children
}

type SignalProps = {
    className: string
    label: string
    testID: string
}

function Signal({ className, label, testID }: SignalProps) {
    return (
        <View style={styles.signalRow}>
            <Text style={styles.signalLabel}>{label}</Text>
            <View style={styles.signalTrack}>
                <StyledView className={className} style={styles.signalBar} testID={testID} />
            </View>
        </View>
    )
}

function App() {
    const [requested, setRequested] = useState<Array<RemoteId>>([])
    const [loaded, setLoaded] = useState<Array<RemoteId>>([])
    const isLoading = requested.length !== loaded.length

    const requestRemote = (id: RemoteId) => {
        if (requested.includes(id) || isLoading) {
            return
        }

        setRequested(current => [...current, id])
    }

    const markLoaded = (id: RemoteId) => {
        setLoaded(current => current.includes(id) ? current : [...current, id])
    }

    const reloadRuntime = () => {
        if (Platform.OS === 'web') {
            globalThis.location.reload()
            return
        }

        DevSettings.reload()
    }

    return (
        <ScrollView contentContainerStyle={styles.page}>
            <View style={styles.header}>
                <Text style={styles.eyebrow}>UNIWIND / MODULE FEDERATION</Text>
                <Text style={styles.title}>Last bundle standing</Text>
                <Text style={styles.intro}>
                    Load both remotes in either order. Only the signal bars use Uniwind classes; the surrounding diagnostic UI uses inline styles.
                </Text>
            </View>

            <View style={styles.controls}>
                <Pressable
                    accessibilityRole="button"
                    disabled={requested.includes('A') || isLoading}
                    onPress={() => requestRemote('A')}
                    style={({ pressed }) => [
                        styles.loadButton,
                        styles.remoteAButton,
                        (requested.includes('A') || isLoading) && styles.disabledButton,
                        pressed && styles.pressedButton,
                    ]}
                >
                    <Text style={[styles.buttonText, styles.remoteAButtonText]}>Load Remote A</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    disabled={requested.includes('B') || isLoading}
                    onPress={() => requestRemote('B')}
                    style={({ pressed }) => [
                        styles.loadButton,
                        styles.remoteBButton,
                        (requested.includes('B') || isLoading) && styles.disabledButton,
                        pressed && styles.pressedButton,
                    ]}
                >
                    <Text style={styles.buttonText}>Load Remote B</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={reloadRuntime}
                    style={({ pressed }) => [
                        styles.reloadButton,
                        pressed && styles.pressedButton,
                    ]}
                >
                    <Text style={styles.reloadButtonText}>Reload runtime</Text>
                </Pressable>
            </View>

            <Text style={styles.order}>
                Load order: {loaded.length === 0 ? 'host only' : `Host -> ${loaded.join(' -> ')}`}
            </Text>

            <View style={styles.panel}>
                <View style={styles.panelHeading}>
                    <View style={[styles.ownerDot, styles.hostDot]} />
                    <View>
                        <Text style={styles.panelTitle}>Host</Text>
                        <Text style={styles.panelMeta}>Declares green (#16a34a)</Text>
                    </View>
                </View>
                <Signal className="mf-host-only" label="Host-only class: #16a34a" testID="host-only" />
                <Signal className="mf-conflict" label="Shared class declares: #16a34a" testID="host-conflict" />
                <Signal className="mf-variable-probe" label="--mf-shared-color: #16a34a" testID="host-variable" />
            </View>

            {requested.includes('A') && (
                <RemoteErrorBoundary name="Remote A">
                    <Suspense fallback={<LoadingRemote name="Remote A" />}>
                        <ReadyBoundary id="A" onReady={markLoaded}>
                            <RemoteA />
                        </ReadyBoundary>
                    </Suspense>
                </RemoteErrorBoundary>
            )}

            {requested.includes('B') && (
                <RemoteErrorBoundary name="Remote B">
                    <Suspense fallback={<LoadingRemote name="Remote B" />}>
                        <ReadyBoundary id="B" onReady={markLoaded}>
                            <RemoteB />
                        </ReadyBoundary>
                    </Suspense>
                </RemoteErrorBoundary>
            )}

            <View style={styles.explanation}>
                <Text style={styles.explanationTitle}>What should break</Text>
                <Text style={styles.explanationText}>
                    On web, owner-only bars remain while shared class and variable bars take the latest remote's color. On native, the latest remote
                    also erases earlier owner-only bars because it replaces the registry. Reversing the load order reverses the winner.
                </Text>
            </View>
        </ScrollView>
    )
}

function LoadingRemote({ name }: { name: string }) {
    return (
        <View style={styles.loading}>
            <ActivityIndicator color="#111827" />
            <Text style={styles.loadingText}>Loading {name}...</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        flexGrow: 1,
        backgroundColor: '#f4f1e8',
        paddingHorizontal: 24,
        paddingVertical: 48,
        gap: 18,
    },
    header: {
        maxWidth: 760,
        gap: 8,
    },
    eyebrow: {
        color: '#5b5a54',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
    },
    title: {
        color: '#151513',
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: -1.5,
    },
    intro: {
        color: '#4b4a45',
        fontSize: 16,
        lineHeight: 24,
        maxWidth: 680,
    },
    controls: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    loadButton: {
        borderRadius: 6,
        paddingHorizontal: 18,
        paddingVertical: 12,
    },
    remoteAButton: {
        backgroundColor: '#facc15',
    },
    remoteBButton: {
        backgroundColor: '#1d4ed8',
    },
    reloadButton: {
        borderColor: '#272722',
        borderRadius: 6,
        borderWidth: 1,
        paddingHorizontal: 18,
        paddingVertical: 11,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    remoteAButtonText: {
        color: '#422006',
    },
    reloadButtonText: {
        color: '#272722',
        fontSize: 14,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.35,
    },
    pressedButton: {
        opacity: 0.7,
    },
    order: {
        color: '#272722',
        fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
        fontSize: 13,
    },
    panel: {
        backgroundColor: '#fffdf6',
        borderColor: '#d6d0bf',
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
    hostDot: {
        backgroundColor: '#16a34a',
    },
    panelTitle: {
        color: '#151513',
        fontSize: 19,
        fontWeight: '800',
    },
    panelMeta: {
        color: '#706e65',
        fontSize: 12,
    },
    signalRow: {
        gap: 6,
    },
    signalLabel: {
        color: '#3d3c37',
        fontSize: 13,
        fontWeight: '600',
    },
    signalTrack: {
        backgroundColor: '#e5e1d6',
        borderColor: '#c9c3b4',
        borderRadius: 4,
        borderWidth: 1,
        height: 34,
        overflow: 'hidden',
    },
    signalBar: {
        height: '100%',
        width: '100%',
    },
    loading: {
        alignItems: 'center',
        backgroundColor: '#fffdf6',
        borderColor: '#d6d0bf',
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 10,
        maxWidth: 760,
        padding: 18,
    },
    loadingText: {
        color: '#3d3c37',
        fontSize: 14,
    },
    errorPanel: {
        backgroundColor: '#fff7ed',
        borderColor: '#c2410c',
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
        maxWidth: 760,
        padding: 18,
    },
    errorTitle: {
        color: '#7c2d12',
        fontSize: 16,
        fontWeight: '800',
    },
    errorText: {
        color: '#9a3412',
        fontSize: 13,
        lineHeight: 19,
    },
    explanation: {
        backgroundColor: '#22221e',
        borderRadius: 8,
        gap: 8,
        maxWidth: 760,
        padding: 18,
    },
    explanationTitle: {
        color: '#f7f2e5',
        fontSize: 15,
        fontWeight: '800',
    },
    explanationText: {
        color: '#cbc5b7',
        fontSize: 14,
        lineHeight: 21,
    },
})

export default App
