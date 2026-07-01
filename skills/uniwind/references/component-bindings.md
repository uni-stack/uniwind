## Component Bindings

All core React Native components support `className` out of the box. Some have additional className props for sub-styles (like `contentContainerClassName`) and non-style color props (requiring `accent-` prefix).

### Complete Reference

**Legend**: Props marked with ⚡ require the `accent-` prefix. Props in parentheses are platform-specific.

#### View

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

#### Text

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `selectionColorClassName` | `selectionColor` | ⚡ `accent-` |

#### Pressable

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

Supports `active:`, `disabled:`, `focus:` state selectors.

#### Image

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `tintColorClassName` | `tintColor` | ⚡ `accent-` |

#### TextInput

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `cursorColorClassName` | `cursorColor` | ⚡ `accent-` |
| `selectionColorClassName` | `selectionColor` | ⚡ `accent-` |
| `placeholderTextColorClassName` | `placeholderTextColor` | ⚡ `accent-` |
| `selectionHandleColorClassName` | `selectionHandleColor` | ⚡ `accent-` |
| `underlineColorAndroidClassName` | `underlineColorAndroid` (Android) | ⚡ `accent-` |

Supports `focus:`, `active:`, `disabled:` state selectors.

#### ScrollView

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `contentContainerClassName` | `contentContainerStyle` | — |
| `endFillColorClassName` | `endFillColor` | ⚡ `accent-` |

#### FlatList

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `contentContainerClassName` | `contentContainerStyle` | — |
| `columnWrapperClassName` | `columnWrapperStyle` | — |
| `ListHeaderComponentClassName` | `ListHeaderComponentStyle` | — |
| `ListFooterComponentClassName` | `ListFooterComponentStyle` | — |
| `endFillColorClassName` | `endFillColor` | ⚡ `accent-` |

#### SectionList

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `contentContainerClassName` | `contentContainerStyle` | — |
| `ListHeaderComponentClassName` | `ListHeaderComponentStyle` | — |
| `ListFooterComponentClassName` | `ListFooterComponentStyle` | — |
| `endFillColorClassName` | `endFillColor` | ⚡ `accent-` |

#### VirtualizedList

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `contentContainerClassName` | `contentContainerStyle` | — |
| `ListHeaderComponentClassName` | `ListHeaderComponentStyle` | — |
| `ListFooterComponentClassName` | `ListFooterComponentStyle` | — |
| `endFillColorClassName` | `endFillColor` | ⚡ `accent-` |

#### Switch

| Prop | Maps to | Prefix |
|------|---------|--------|
| `thumbColorClassName` | `thumbColor` | ⚡ `accent-` |
| `trackColorOnClassName` | `trackColor.true` (on) | ⚡ `accent-` |
| `trackColorOffClassName` | `trackColor.false` (off) | ⚡ `accent-` |
| `ios_backgroundColorClassName` | `ios_backgroundColor` (iOS) | ⚡ `accent-` |

Note: Switch does NOT support `className` (`className?: never` in types). Use only the color-specific className props above. Supports `disabled:` state selector.

#### ActivityIndicator

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `colorClassName` | `color` | ⚡ `accent-` |

#### Button

| Prop | Maps to | Prefix |
|------|---------|--------|
| `colorClassName` | `color` | ⚡ `accent-` |

Note: Button does not support `className` (no `style` prop on RN Button).

#### Modal

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `backdropColorClassName` | `backdropColor` | ⚡ `accent-` |

#### RefreshControl

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `colorsClassName` | `colors` (Android) | ⚡ `accent-` |
| `tintColorClassName` | `tintColor` (iOS) | ⚡ `accent-` |
| `titleColorClassName` | `titleColor` (iOS) | ⚡ `accent-` |
| `progressBackgroundColorClassName` | `progressBackgroundColor` (Android) | ⚡ `accent-` |

#### ImageBackground

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `imageClassName` | `imageStyle` | — |
| `tintColorClassName` | `tintColor` | ⚡ `accent-` |

#### SafeAreaView

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

#### KeyboardAvoidingView

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `contentContainerClassName` | `contentContainerStyle` | — |

#### InputAccessoryView

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `backgroundColorClassName` | `backgroundColor` | ⚡ `accent-` |

#### TouchableHighlight

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `underlayColorClassName` | `underlayColor` | ⚡ `accent-` |

Supports `active:`, `disabled:` state selectors.

#### TouchableOpacity

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

Supports `active:`, `disabled:` state selectors.

#### TouchableNativeFeedback

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

Supports `active:`, `disabled:` state selectors.

#### TouchableWithoutFeedback

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

Supports `active:`, `disabled:` state selectors.

### Usage Examples

```tsx
import { View, Text, Pressable, TextInput, ScrollView, FlatList, Switch, Image, ActivityIndicator, Modal, RefreshControl, Button } from 'react-native';

// View — basic layout
<View className="flex-1 bg-background p-4">
  <Text className="text-foreground text-lg font-bold">Title</Text>
</View>

// Pressable — with press/focus states
<Pressable className="bg-primary px-6 py-3 rounded-lg active:opacity-80 active:bg-primary/90 focus:ring-2">
  <Text className="text-white text-center font-semibold">Press Me</Text>
</Pressable>

// TextInput — with focus state and accent- color props
<TextInput
  className="border border-border rounded-lg px-4 py-2 text-base text-foreground focus:border-primary"
  placeholderTextColorClassName="accent-muted"
  selectionColorClassName="accent-primary"
  cursorColorClassName="accent-primary"
  selectionHandleColorClassName="accent-primary"
  underlineColorAndroidClassName="accent-transparent"
  placeholder="Enter text..."
/>

// ScrollView — with content container
<ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
  {/* content */}
</ScrollView>

// FlatList — with all sub-style props
<FlatList
  className="flex-1"
  contentContainerClassName="p-4 gap-3"
  columnWrapperClassName="gap-3"
  ListHeaderComponentClassName="pb-4"
  ListFooterComponentClassName="pt-4"
  endFillColorClassName="accent-gray-100"
  numColumns={2}
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
/>

// Switch — no className support, use color-specific props only
<Switch
  thumbColorClassName="accent-white"
  trackColorOnClassName="accent-primary"
  trackColorOffClassName="accent-gray-300 dark:accent-gray-700"
  ios_backgroundColorClassName="accent-gray-200"
/>

// Image — tint color
<Image className="w-6 h-6" tintColorClassName="accent-primary" source={icon} />

// ActivityIndicator
<ActivityIndicator className="m-4" colorClassName="accent-primary" size="large" />

// Button — only colorClassName (no className)
<Button colorClassName="accent-primary" title="Submit" onPress={handleSubmit} />

// Modal — backdrop color
<Modal className="flex-1" backdropColorClassName="accent-black/50">
  {/* content */}
</Modal>

// RefreshControl — platform-specific color props
<RefreshControl
  className="p-4"
  tintColorClassName="accent-primary"
  titleColorClassName="accent-gray-500"
  colorsClassName="accent-primary"
  progressBackgroundColorClassName="accent-white dark:accent-gray-800"
/>

// ImageBackground — separate image styling
<ImageBackground
  className="flex-1 justify-center items-center"
  imageClassName="opacity-50"
  tintColorClassName="accent-blue-500"
  source={bgImage}
>
  <Text className="text-white text-2xl font-bold">Overlay</Text>
</ImageBackground>

// KeyboardAvoidingView
<KeyboardAvoidingView
  behavior="padding"
  className="flex-1 bg-white"
  contentContainerClassName="p-4 justify-end"
>
  <TextInput className="border border-gray-300 rounded-lg p-3" placeholder="Type..." />
</KeyboardAvoidingView>

// InputAccessoryView
<InputAccessoryView
  className="p-4 border-t border-gray-300"
  backgroundColorClassName="accent-white dark:accent-gray-800"
>
  <Button title="Done" onPress={dismissKeyboard} />
</InputAccessoryView>

// TouchableHighlight — underlay color
<TouchableHighlight
  className="bg-blue-500 px-6 py-3 rounded-lg"
  underlayColorClassName="accent-blue-600 dark:accent-blue-700"
  onPress={handlePress}
>
  <Text className="text-white font-semibold">Press Me</Text>
</TouchableHighlight>
```

## The accent- Prefix Pattern

React Native components have props like `color`, `tintColor`, `thumbColor` that are NOT part of the `style` object. To set these via Tailwind classes, use the `accent-` prefix with the corresponding `{propName}ClassName` prop:

```tsx
// color prop → colorClassName with accent- prefix
<ActivityIndicator colorClassName="accent-blue-500 dark:accent-blue-400" />
<Button colorClassName="accent-primary" title="Submit" />

// tintColor prop → tintColorClassName
<Image className="w-6 h-6" tintColorClassName="accent-red-500" source={icon} />

// thumbColor → thumbColorClassName
<Switch thumbColorClassName="accent-white" trackColorOnClassName="accent-primary" />

// placeholderTextColor → placeholderTextColorClassName
<TextInput placeholderTextColorClassName="accent-gray-400 dark:accent-gray-600" />
```

**CRITICAL Rule**: `className` maps to the `style` prop — it handles layout, typography, backgrounds, borders, etc. But React Native has many color props that live OUTSIDE of `style` (like `color`, `tintColor`, `thumbColor`, `placeholderTextColor`). These require a separate `{propName}ClassName` prop with the `accent-` prefix. Without `accent-`, the class resolves to a style object — but these props expect a plain color string.

```tsx
// WRONG — className sets style, but ActivityIndicator's color is NOT a style prop
<ActivityIndicator className="text-blue-500" />  // color will NOT be set

// CORRECT — use the dedicated colorClassName prop with accent- prefix
<ActivityIndicator colorClassName="accent-blue-500" />  // color IS set to #3b82f6

// WRONG — tintColor is not a style prop on Image
<Image className="tint-blue-500" source={icon} />  // won't work

// CORRECT
<Image tintColorClassName="accent-blue-500" source={icon} />
```
