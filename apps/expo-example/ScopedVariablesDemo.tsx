import { Text, View } from 'react-native'
import { ScopedVariables, useCSSVariable } from 'uniwind'

// Where a variable's value comes from at the point it is read:
//  - default:   the theme value from global.css (no provider overrode it)
//  - override:  set by the nearest <ScopedVariables> wrapping this card
//  - inherited: set by an ancestor provider and cascaded down unchanged
type Origin = 'default' | 'override' | 'inherited'

const ORIGIN_META: Record<Origin, { label: string; pill: string; text: string }> = {
    default: { label: 'theme default', pill: 'bg-gray-200', text: 'text-gray-700' },
    override: { label: 'set here', pill: 'bg-green-200', text: 'text-green-900' },
    inherited: { label: 'inherited', pill: 'bg-blue-200', text: 'text-blue-900' },
}

const OriginPill = ({ origin }: { origin: Origin }) => {
    const meta = ORIGIN_META[origin]

    return (
        <View className={`px-2 py-0.5 rounded-full ${meta.pill}`}>
            <Text className={`text-[10px] font-medium ${meta.text}`}>{meta.label}</Text>
        </View>
    )
}

// One variable, its resolved value, a swatch (for colors), and an origin pill.
const VarRow = ({ name, origin }: { name: string; origin: Origin }) => {
    const value = useCSSVariable(name)
    const isColor = typeof value === 'string' && value.startsWith('#')

    return (
        <View className="flex-row items-center gap-2">
            {isColor
                ? <View className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: value }} />
                : (
                    <View className="w-4 h-4 rounded border border-gray-200 bg-gray-50 items-center justify-center">
                        <Text className="text-[10px] text-gray-400">#</Text>
                    </View>
                )}
            <Text className="text-xs text-gray-700 flex-1">
                {name} = <Text className="font-semibold">{value === undefined ? '(unset)' : String(value)}</Text>
            </Text>
            <OriginPill origin={origin} />
        </View>
    )
}

// A row of blocks separated by gap-(--gap). The space between the blocks IS
// the --gap value, so the difference between cards is directly visible.
const GapStrip = () => (
    <View className="flex-row gap-(--gap) items-center">
        <View className="w-6 h-6 rounded bg-(--color-primary)" />
        <View className="w-6 h-6 rounded bg-(--color-primary)" />
        <View className="w-6 h-6 rounded bg-(--color-primary)" />
        <View className="w-6 h-6 rounded bg-(--color-primary)" />
        <Text className="text-[10px] text-gray-400">← space between = --gap</Text>
    </View>
)

// The card's header bar uses --color-primary (so you SEE the accent), and the
// GapStrip visualizes --gap as the space between blocks (so you SEE it change).
const AccentCard = ({ title, primary, gap }: { title: string; primary: Origin; gap: Origin }) => (
    <View className="bg-(--color-surface) rounded-lg border border-gray-200 overflow-hidden">
        <View className="bg-(--color-primary) px-4 py-3">
            <Text className="text-white font-semibold">{title}</Text>
        </View>
        <View className="p-4 gap-3">
            <VarRow name="--color-primary" origin={primary} />
            <VarRow name="--gap" origin={gap} />
            <GapStrip />
        </View>
    </View>
)

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <View className="mb-2 mt-2">
        <Text className="text-lg font-semibold text-gray-800">{title}</Text>
        <Text className="text-xs text-gray-500">{subtitle}</Text>
    </View>
)

export const ScopedVariablesDemo = () => {
    return (
        <View className="px-4 mb-8">
            <Text className="text-2xl font-bold text-gray-800">Scoped Variables</Text>
            <Text className="text-sm text-gray-500 mb-3">
                Every card below is the same component. Only the wrapping <Text className="font-semibold">{'<ScopedVariables>'}</Text>{' '}
                changes the values it reads.
            </Text>

            {/* Legend explaining the origin pills */}
            <View className="flex-row flex-wrap items-center gap-2 mb-2 bg-white rounded-lg border border-gray-200 p-3">
                <Text className="text-xs text-gray-600 mr-1">Value origin:</Text>
                <OriginPill origin="default" />
                <OriginPill origin="override" />
                <OriginPill origin="inherited" />
            </View>

            {/* 1. No provider — values come straight from global.css */}
            <SectionHeader title="1. Theme default" subtitle="No provider. Both variables use the global.css theme values." />
            <AccentCard title="Default card" primary="default" gap="default" />

            {/* 2. One provider overriding both variables */}
            <SectionHeader title="2. Scoped override" subtitle="One <ScopedVariables> overrides both --color-primary and --gap for this subtree." />
            <ScopedVariables variables={{ '--color-primary': '#e11d48', '--gap': 16 }}>
                <AccentCard title="Premium card" primary="override" gap="override" />
            </ScopedVariables>

            {/* 3. Nested — inner sits INSIDE outer, overrides color, inherits gap */}
            <SectionHeader
                title="3. Nested (nearest wins)"
                subtitle="Inner provider is inside outer. It overrides --color-primary; --gap cascades down from outer."
            />
            <ScopedVariables variables={{ '--color-primary': '#16a34a', '--gap': 24 }}>
                <AccentCard title="Outer card" primary="override" gap="override" />
                <View className="mt-3 pl-4 border-l-2 border-gray-300">
                    <Text className="text-[11px] text-gray-400 mb-1">↳ nested inside “Outer card”</Text>
                    <ScopedVariables variables={{ '--color-primary': '#9333ea' }}>
                        <AccentCard title="Inner card" primary="override" gap="inherited" />
                    </ScopedVariables>
                </View>
            </ScopedVariables>

            {/* 4. A scoped override plus an opt-in stable cacheKey (native caching) */}
            <SectionHeader
                title="4. Cached subtree (cacheKey)"
                subtitle="A scoped override with a stable cacheKey, which re-enables the native style cache for this subtree."
            />
            <ScopedVariables variables={{ '--color-primary': '#f59e0b', '--gap': 8 }} cacheKey="demo-amber">
                <AccentCard title="Amber card" primary="override" gap="override" />
            </ScopedVariables>
        </View>
    )
}
