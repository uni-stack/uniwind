import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

export default function Fallback() {
    return (
        <View style={styles.container}>
            <ActivityIndicator color="#111827" />
            <Text style={styles.text}>Initializing Module Federation...</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#f4f1e8',
        flex: 1,
        gap: 12,
        justifyContent: 'center',
    },
    text: {
        color: '#272722',
        fontSize: 14,
        fontWeight: '600',
    },
})
