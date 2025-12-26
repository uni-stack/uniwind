import { ThemedText } from '@/components/themed-text'
import { withUniwind } from '@niibase/uniwind'
import { useHeaderHeight } from '@react-navigation/elements'
import { GlassView } from 'expo-glass-effect'
import React from 'react'
import { Image, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const StyledGlassViewAutoMapping = withUniwind(GlassView)

/**
 * GlassView has glassEffectStyle prop, auto mapping is not feasible here
 * But we can just map the className to the style prop
 */
const StyledGlassViewManualMapping = withUniwind(GlassView, {
    style: {
        fromClassName: 'className',
    },
    tintColor: {
        fromClassName: 'tintColorClassName',
        styleProperty: 'backgroundColor',
    },
})

export default function GlassViewScreen() {
    const insets = useSafeAreaInsets()
    const headerHeight = useHeaderHeight()

    return (
        <>
            <Image
                className="absolute inset-0 dark:opacity-40"
                source={{
                    uri: 'https://images.unsplash.com/photo-1670506761128-2076c4c881da?w=1400&h=1400&fit=crop',
                }}
            />
            <ScrollView
                className="flex-1 px-12"
                style={{ paddingTop: headerHeight, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}
            >
                <View className="flex-1 px-4 gap-4">
                    {/* Plain usage with style prop */}
                    <GlassView
                        glassEffectStyle="clear"
                        tintColor="#eab30880"
                        style={{ width: '100%', height: 160, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ThemedText>Plain usage with style prop</ThemedText>
                    </GlassView>

                    {/* Works as expected */}
                    <StyledGlassViewManualMapping
                        glassEffectStyle="clear"
                        tintColorClassName="bg-yellow-500/50 dark:bg-yellow-800/70"
                        className="w-full h-40 rounded-4xl items-center justify-center"
                    >
                        <ThemedText>Works as expected with manual mapping</ThemedText>
                    </StyledGlassViewManualMapping>

                    {/* Dosn't render at all */}
                    <StyledGlassViewAutoMapping
                        // if glassEffectStyle is set, it will not render at all
                        glassEffectStyle="clear"
                        tintColor="#eab30880"
                        className="w-full h-40 rounded-4xl items-center justify-center"
                    >
                        <ThemedText>Doesn&apos;t render at all with auto mapping</ThemedText>
                    </StyledGlassViewAutoMapping>
                </View>
            </ScrollView>
        </>
    )
}
