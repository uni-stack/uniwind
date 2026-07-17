import { Text, View } from 'react-native'
import { ScopedVariables, useCSSVariable } from 'uniwind'

// Reads a variable through the runtime and prints its resolved value. Inside a
// <ScopedVariables> subtree it reflects the scoped override; outside it falls
// back to the theme default from global.css.
const VariableReadout = ({ name }: { name: string }) => {
    const value = useCSSVariable(name)

    return (
        <Text className="text-xs text-gray-500 mt-1">
            {name} = {value === undefined ? '(unset)' : String(value)}
        </Text>
    )
}

// A card whose accent color and inner spacing come entirely from CSS variables.
// The same markup renders differently depending on the surrounding scope.
const AccentCard = ({ label }: { label: string }) => (
    <View className="bg-(--color-surface) gap-(--gap) rounded-lg p-4 border border-gray-200">
        <View className="bg-(--color-primary) h-10 rounded justify-center px-3">
            <Text className="text-white font-semibold">{label}</Text>
        </View>
        <Text className="text-(--color-primary) font-medium">Accent text uses --color-primary</Text>
        <VariableReadout name="--color-primary" />
        <VariableReadout name="--gap" />
    </View>
)

export const ScopedVariablesDemo = () => {
    return (
        <View className="px-4 mb-8">
            <Text className="text-2xl font-bold mb-4 text-gray-800">Scoped Variables</Text>

            {/* 1. Theme defaults — no provider, values come from global.css */}
            <Text className="text-lg font-semibold mb-2 text-gray-700">Theme default</Text>
            <View className="mb-4">
                <AccentCard label="Default card" />
            </View>

            {/* 2. Scoped override — same markup, different accent + spacing */}
            <Text className="text-lg font-semibold mb-2 text-gray-700">Scoped override</Text>
            <ScopedVariables variables={{ '--color-primary': '#e11d48', '--gap': 16 }}>
                <View className="mb-4">
                    <AccentCard label="Premium card" />
                </View>
            </ScopedVariables>

            {/* 3. Nested providers — inner overrides color, inherits --gap */}
            <Text className="text-lg font-semibold mb-2 text-gray-700">Nested (nearest wins)</Text>
            <ScopedVariables variables={{ '--color-primary': '#16a34a', '--gap': 24 }}>
                <View className="gap-(--gap) mb-4">
                    <AccentCard label="Outer (green, gap 24)" />
                    <ScopedVariables variables={{ '--color-primary': '#9333ea' }}>
                        <AccentCard label="Inner (purple, inherits gap 24)" />
                    </ScopedVariables>
                </View>
            </ScopedVariables>

            {/* 4. Opt-in native caching via a stable cacheKey */}
            <Text className="text-lg font-semibold mb-2 text-gray-700">Cached subtree (cacheKey)</Text>
            <ScopedVariables variables={{ '--color-primary': '#f59e0b', '--gap': 8 }} cacheKey="demo-amber">
                <View className="mb-4">
                    <AccentCard label="Amber card (cached)" />
                </View>
            </ScopedVariables>
        </View>
    )
}
