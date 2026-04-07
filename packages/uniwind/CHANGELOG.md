## What's Changed in 1.6.2



### 🐛 Bug Fixes
* fix: read absolute cssPath instead of relative one in metro-transformer by @Brentlok in [#485](https://github.com/uni-stack/uniwind/pull/485)
* fix: css file transforming for special setups by @Brentlok in [#483](https://github.com/uni-stack/uniwind/pull/483)


### 🏠 Chores
* chore: add missing accent- warning in dev by @Brentlok in [#479](https://github.com/uni-stack/uniwind/pull/479)


### 📦 Other
* ci: fix generating changelog was missing new lines in groups by @Brentlok in [#478](https://github.com/uni-stack/uniwind/pull/478)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.6.1...v1.6.2## What's Changed in 1.6.1



### 🐛 Bug Fixes
* fix: pass data attributes to withUniwind by @Brentlok in [#477](https://github.com/uni-stack/uniwind/pull/477)
* fix: p3 color parsing by @Brentlok in [#476](https://github.com/uni-stack/uniwind/pull/476)


### 🧪 Testing
* test: advanced type check for ThemeName by @Brentlok in [#465](https://github.com/uni-stack/uniwind/pull/465)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.6.0...v1.6.1## What's Changed in 1.6.0



### 🚀 Features
* feat: export ThemeName and make themes public in Uniwind class by @Brentlok in [#460](https://github.com/uni-stack/uniwind/pull/460)
* border circular by @Brentlok
* feat: built in border-continuous by @Brentlok in [#444](https://github.com/uni-stack/uniwind/pull/444)


### 🐛 Bug Fixes
* fix: parsing multiple transforms tokens in single class by @Brentlok in [#451](https://github.com/uni-stack/uniwind/pull/451)
* fix: pass data attributes correctly to RNW by @Brentlok in [#443](https://github.com/uni-stack/uniwind/pull/443)
* fix: getWebStyles not return default html styles by @Brentlok in [#440](https://github.com/uni-stack/uniwind/pull/440)


### 🧪 Testing
* test: setup playwright tests by @Brentlok in [#437](https://github.com/uni-stack/uniwind/pull/437)


### 🏠 Chores
* chore: validate each entry in serialization instead of whole object by @Brentlok in [#456](https://github.com/uni-stack/uniwind/pull/456)
* chore: fix cliff template error by @Brentlok in [#442](https://github.com/uni-stack/uniwind/pull/442)
* chore: update deps, update expo to 55 by @Brentlok in [#436](https://github.com/uni-stack/uniwind/pull/436)
* chore: changelog order by @Brentlok in [#435](https://github.com/uni-stack/uniwind/pull/435)
* chore: add emojis to changelog by @Brentlok in [#434](https://github.com/uni-stack/uniwind/pull/434)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.5.0...v1.6.0## What's Changed in 1.5.0



### 🚀 Features
* feat: tv selectors, focus: selector for pressables by @Brentlok in [#425](https://github.com/uni-stack/uniwind/pull/425)


### 🐛 Bug Fixes
* fix: guard against display: box from line-clamp-* classes by @a16n-dev in [#424](https://github.com/uni-stack/uniwind/pull/424)


### 📦 Other
* ci: release action using release-it by @Brentlok in [#426](https://github.com/uni-stack/uniwind/pull/426)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.4.1...v1.5.0## What's Changed in 1.4.1



### 🐛 Bug Fixes
* fix: move theme selector out of the root, and remove nulls by @Brentlok in [#420](https://github.com/uni-stack/uniwind/pull/420)


### 🏠 Chores
* bump version to 1.4.1 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.4.0...v1.4.1## What's Changed in 1.4.0



### 🚀 Features
* feat: scoped theme by @Brentlok in [#393](https://github.com/uni-stack/uniwind/pull/393)


### 🐛 Bug Fixes
* fix: merge border colors parsing by @Brentlok in [#414](https://github.com/uni-stack/uniwind/pull/414)
* fix: treat invalid js expression as plain string by @Brentlok in [#410](https://github.com/uni-stack/uniwind/pull/410)
* fix: gradient parsing with % and variables by @Brentlok in [#403](https://github.com/uni-stack/uniwind/pull/403)


### 🏠 Chores
* bump version to 1.4.0 by @github-actions[bot]
* chore: fix cleanup css visitor on hot reload by @Brentlok in [#412](https://github.com/uni-stack/uniwind/pull/412)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.3.2...v1.4.0## What's Changed in 1.3.2



### 🐛 Bug Fixes
* fix: fontScale and pixelRatio without arguments by @Brentlok in [#388](https://github.com/uni-stack/uniwind/pull/388)
* fix: preserve start/end spacing properties by @khaled-hamam in [#383](https://github.com/uni-stack/uniwind/pull/383)


### 🏠 Chores
* bump version to 1.3.2 by @github-actions[bot]


### New Contributors
* @khaled-hamam made their first contribution in [#383](https://github.com/uni-stack/uniwind/pull/383)
**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.3.1...v1.3.2## What's Changed in 1.3.1



### 🐛 Bug Fixes
* fix: subscribe to updates before triggering listeners by @Brentlok in [#379](https://github.com/uni-stack/uniwind/pull/379)
* fix: withUniwind merge with inline by @Brentlok in [#378](https://github.com/uni-stack/uniwind/pull/378)
* fix: remove mjs export for metro config by @Brentlok in [#376](https://github.com/uni-stack/uniwind/pull/376)
* fix(vite): fix RNW styles in production builds by @dannyhw in [#368](https://github.com/uni-stack/uniwind/pull/368)


### 🏠 Chores
* bump version to 1.3.1 by @github-actions[bot]


### New Contributors
* @dannyhw made their first contribution in [#368](https://github.com/uni-stack/uniwind/pull/368)
**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.3.0...v1.3.1## What's Changed in 1.3.0



### 🚀 Features
* feat: support data attributes by @Brentlok in [#339](https://github.com/uni-stack/uniwind/pull/339)


### 🐛 Bug Fixes
* fix: custom insets parsing by @Brentlok in [#355](https://github.com/uni-stack/uniwind/pull/355)
* fix: Image size, TextInput placeholder color and disabled:, Pressable disabled: not working on web by @Brentlok in [#349](https://github.com/uni-stack/uniwind/pull/349)
* fix: updateCSSVariable only for the same theme by @Brentlok in [#345](https://github.com/uni-stack/uniwind/pull/345)


### 🏠 Chores
* bump version to 1.3.0 by @github-actions[bot]
* handle simple data attributes by @Brentlok


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.2.7...v1.3.0## What's Changed in 1.2.7



### 🐛 Bug Fixes
* fix: patch rnw to wrap default styles with css layer by @Brentlok in [#337](https://github.com/uni-stack/uniwind/pull/337)
* fix(vite): resolve Animated components by @burakgormek in [#322](https://github.com/uni-stack/uniwind/pull/322)
* fix: support both new and old ColorSchemeName in RN by @Brentlok in [#331](https://github.com/uni-stack/uniwind/pull/331)


### 🏠 Chores
* bump version to 1.2.7 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.2.6...v1.2.7## What's Changed in 1.2.6



### 🐛 Bug Fixes
* fix: check for resolver internal path by @Brentlok in [#321](https://github.com/uni-stack/uniwind/pull/321)


### 🏠 Chores
* bump version to 1.2.6 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.2.5...v1.2.6## What's Changed in 1.2.5



### 🚀 Features
* feat: support custom spacings in safe area utilities by @Brentlok in [#313](https://github.com/uni-stack/uniwind/pull/313)
* feat: add parseColor runtime and metro support for it by @Brentlok in [#312](https://github.com/uni-stack/uniwind/pull/312)


### 🐛 Bug Fixes
* fix: resolve react native directories that are not node_modules by @Brentlok in [#319](https://github.com/uni-stack/uniwind/pull/319)
* fix: prevent maximum call stack size exceeded in metro by @jpudysz in [#314](https://github.com/uni-stack/uniwind/pull/314)


### 🏠 Chores
* bump version to 1.2.5 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.2.4...v1.2.5## What's Changed in 1.2.4



### 🐛 Bug Fixes
* fix: exclude Animated from skipping custom resolver by @Brentlok in [#295](https://github.com/uni-stack/uniwind/pull/295)
* fix: dont add whitespace around dot by @Brentlok in [#294](https://github.com/uni-stack/uniwind/pull/294)
* fix: make onThemeChange protected property by @Brentlok in [#288](https://github.com/uni-stack/uniwind/pull/288)
* fix: join borderWidth styles if duplicated by @Brentlok in [#285](https://github.com/uni-stack/uniwind/pull/285)


### 🏠 Chores
* bump version to 1.2.4 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.2.3...v1.2.4## What's Changed in 1.2.3



### 🚀 Features
* feat: more built in safe area utilities by @Brentlok in [#280](https://github.com/uni-stack/uniwind/pull/280)


### 🐛 Bug Fixes
* fix: use absolute URL for banner image in README by @jpudysz in [#284](https://github.com/uni-stack/uniwind/pull/284)
* fix: update nativeResolver to exclude @react-native paths for resolution by @jpudysz in [#283](https://github.com/uni-stack/uniwind/pull/283)
* fix: enhance nativeResolver to exclude react-native internals by @jpudysz in [#279](https://github.com/uni-stack/uniwind/pull/279)
* fix: closing and opening parenthesis should be serialized by @Brentlok in [#271](https://github.com/uni-stack/uniwind/pull/271)
* fix(web): add cjs dirname for storybook by @burakgormek in [#260](https://github.com/uni-stack/uniwind/pull/260)
* fix: useUniwind type with moduleSuffixes by @Brentlok in [#256](https://github.com/uni-stack/uniwind/pull/256)
* fix: filter out contextType when copying component properties by @divineniiquaye in [#252](https://github.com/uni-stack/uniwind/pull/252)
* fix: compare css contents correctly before writing file by @a16n-dev in [#250](https://github.com/uni-stack/uniwind/pull/250)
* fix: Include LICENSE file in the published package by @chimame in [#223](https://github.com/uni-stack/uniwind/pull/223)
* fix: resolve external css imports by @burakgormek in [#218](https://github.com/uni-stack/uniwind/pull/218)


### 📚 Documentation
* add contribution guideline in readme by @Brentlok


### 🧪 Testing
* test: jest tests for parsing styles and native components by @Brentlok in [#230](https://github.com/uni-stack/uniwind/pull/230)


### 🏠 Chores
* bump version to 1.2.3 by @github-actions[bot]
* improve listener disposing by @Brentlok
* copy assets to build by @Brentlok
* bump version to 1.2.2 by @github-actions[bot]


### New Contributors
* @a16n-dev made their first contribution in [#250](https://github.com/uni-stack/uniwind/pull/250)
* @chimame made their first contribution in [#223](https://github.com/uni-stack/uniwind/pull/223)
**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.2.1...v1.2.3## What's Changed in 1.2.1



### 🚀 Features
* add mising support for tvOS, windows and macOS by @jpudysz


### 🏠 Chores
* bump version to 1.2.1 by @github-actions[bot]


### 📦 Other
* feat: add mising support for tvOS, windows and macOS by @jpudysz in [#217](https://github.com/uni-stack/uniwind/pull/217)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.2.0...v1.2.1## What's Changed in 1.2.0



### 🚀 Features
* feat: add updateInsets public function to uniwind by @divineniiquaye in [#211](https://github.com/uni-stack/uniwind/pull/211)
* feat(web): add Vite support by @burakgormek in [#182](https://github.com/uni-stack/uniwind/pull/182)


### 🐛 Bug Fixes
* perf(native): optimize useStyle used in native components by @divineniiquaye in [#210](https://github.com/uni-stack/uniwind/pull/210)
* fix: process baseline-position by @burakgormek in [#213](https://github.com/uni-stack/uniwind/pull/213)


### ⚡ Performance
* perf(web): optimize cssListener for rapid stylesheet additions by @ForestSpark in [#209](https://github.com/uni-stack/uniwind/pull/209)


### 🏠 Chores
* bump version to 1.2.0 by @github-actions[bot]


### New Contributors
* @divineniiquaye made their first contribution in [#210](https://github.com/uni-stack/uniwind/pull/210)
* @burakgormek made their first contribution in [#213](https://github.com/uni-stack/uniwind/pull/213)
* @ForestSpark made their first contribution in [#209](https://github.com/uni-stack/uniwind/pull/209)
**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.1.0...v1.2.0## What's Changed in 1.1.0



### 🚀 Features
* feat: css variables listener by @Brentlok in [#204](https://github.com/uni-stack/uniwind/pull/204)
* feat: parsing unresolved color by @Brentlok in [#203](https://github.com/uni-stack/uniwind/pull/203)
* feat: dynamic themes by @Brentlok in [#193](https://github.com/uni-stack/uniwind/pull/193)


### 🐛 Bug Fixes
* fix: infer component in withUniwind to forward ref type properly by @Brentlok in [#208](https://github.com/uni-stack/uniwind/pull/208)
* fix: deep equal check by @Brentlok in [#202](https://github.com/uni-stack/uniwind/pull/202)


### 🏠 Chores
* bump version to 1.1.0 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.5...v1.1.0## What's Changed in 1.0.5



### 🚀 Features
* feat: allow for array in useCSSVariable by @Brentlok in [#181](https://github.com/uni-stack/uniwind/pull/181)
* support text-shadow by @Brentlok


### 🐛 Bug Fixes
* fix: remove duplicated styles parsed styles by @Brentlok in [#192](https://github.com/uni-stack/uniwind/pull/192)


### 🏠 Chores
* bump version to 1.0.5 by @github-actions[bot]
* update repository name by @Brentlok
* bump version to 1.0.5 by @github-actions[bot]
* chore: move theme injection to __reinit callback by @Brentlok in [#190](https://github.com/uni-stack/uniwind/pull/190)
* fix banner image in package README by @Simek


### 📦 Other
* feat: support text-shadow by @Brentlok in [#180](https://github.com/uni-stack/uniwind/pull/180)
* chore: fix banner image in package README by @jpudysz in [#176](https://github.com/uni-stack/uniwind/pull/176)


### New Contributors
* @Simek made their first contribution
**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.4...v1.0.5## What's Changed in 1.0.4



### 🐛 Bug Fixes
* document is undefined on server by @Brentlok


### 🏠 Chores
* bump version to 1.0.4 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.3...v1.0.4## What's Changed in 1.0.3



### 🚀 Features
* feat: shared listener by @Brentlok in [#166](https://github.com/uni-stack/uniwind/pull/166)


### 🐛 Bug Fixes
* dont parse % mixed with other units by @Brentlok
* add missing spaces before this in more cases by @Brentlok
* skew parsing by @Brentlok


### 🏠 Chores
* bump version to 1.0.3 by @github-actions[bot]
* log error when theme variables are missing by @Brentlok
* always log errors, hide warnings with debug flag by @Brentlok


### 📦 Other
* Fix parsing issues by @Brentlok in [#169](https://github.com/uni-stack/uniwind/pull/169)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.2...v1.0.3## What's Changed in 1.0.2



### 🐛 Bug Fixes
* always use screen width for breakpoints check by @Brentlok
* fix: unnecessary rerenders caused by setting system theme by @Brentlok in [#160](https://github.com/uni-stack/uniwind/pull/160)
* fix: minor parsing improvements by @Brentlok in [#159](https://github.com/uni-stack/uniwind/pull/159)


### 🏠 Chores
* bump version to 1.0.2 by @github-actions[bot]
* filter out drop-shadow and track-list from parsing by @Brentlok


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.1...v1.0.2## What's Changed in 1.0.1



### 🚀 Features
* change native components color while using light and dark theme by @jpudysz


### 🐛 Bug Fixes
* fix(web): always recalculate styles on theme change by @Brentlok in [#158](https://github.com/uni-stack/uniwind/pull/158)
* fix: add missing spaces after " by @Brentlok in [#157](https://github.com/uni-stack/uniwind/pull/157)
* fix: serializing undefined by @Brentlok in [#147](https://github.com/uni-stack/uniwind/pull/147)
* condition for Appearance when enabling adaptive themes by @jpudysz
* fix(web): dont camelize css vars by @Brentlok in [#137](https://github.com/uni-stack/uniwind/pull/137)


### 🏠 Chores
* bump version to 1.0.1 by @github-actions[bot]
* patch tests by @Brentlok
* chore: move lightningcss to dependency, remove chokidar by @Brentlok in [#146](https://github.com/uni-stack/uniwind/pull/146)
* chore: remove postcss and chalk from peerDeps, use unstable_transformer path by @Brentlok in [#139](https://github.com/uni-stack/uniwind/pull/139)


### 📦 Other
* fix: condition for Appearance when enabling adaptive themes by @jpudysz in [#140](https://github.com/uni-stack/uniwind/pull/140)
* feat: change native components color while using light and dark theme by @jpudysz in [#138](https://github.com/uni-stack/uniwind/pull/138)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0...v1.0.1## What's Changed in 1.0.0



### 🐛 Bug Fixes
* fix: hot reloading css by @Brentlok in [#132](https://github.com/uni-stack/uniwind/pull/132)


### 🏠 Chores
* bump version to 1.0.0 by @github-actions[bot]
* change next to latest by @jpudysz
* chore: metro logs behind a debug flag by @Brentlok in [#131](https://github.com/uni-stack/uniwind/pull/131)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0-rc.8...v1.0.0## What's Changed in 1.0.0-rc.8



### 🐛 Bug Fixes
* fix: parse absolute css dependencies by @Brentlok in [#129](https://github.com/uni-stack/uniwind/pull/129)
* fix: process only entry css file by @Brentlok in [#128](https://github.com/uni-stack/uniwind/pull/128)
* fix: importing css variants by @Brentlok in [#126](https://github.com/uni-stack/uniwind/pull/126)
* fix: use live colorScheme getter and emit change when adaptive flag toggles by @Brentlok in [#119](https://github.com/uni-stack/uniwind/pull/119)


### 🏠 Chores
* bump version to 1.0.0-rc.8 by @github-actions[bot]
* chore: update dependencies, and use catalog's by @Brentlok in [#125](https://github.com/uni-stack/uniwind/pull/125)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0-rc.7...v1.0.0-rc.8## What's Changed in 1.0.0-rc.7



### 🚀 Features
* feat: new simpler js serializer by @Brentlok in [#115](https://github.com/uni-stack/uniwind/pull/115)


### 🐛 Bug Fixes
* fix: css base path passed to tailwind compiler by @Brentlok in [#117](https://github.com/uni-stack/uniwind/pull/117)


### 🏠 Chores
* bump version to 1.0.0-rc.7 by @github-actions[bot]
* minor serializer improvements by @Brentlok


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0-rc.6...v1.0.0-rc.7## What's Changed in 1.0.0-rc.6



### 🚀 Features
* feat: support specific colors by @Brentlok in [#114](https://github.com/uni-stack/uniwind/pull/114)


### 🐛 Bug Fixes
* fix: useCSSVariable not reactive by @Brentlok in [#112](https://github.com/uni-stack/uniwind/pull/112)
* fix: handle outline styles by @Brentlok in [#111](https://github.com/uni-stack/uniwind/pull/111)
* fix: disable metro cache by @Brentlok in [#106](https://github.com/uni-stack/uniwind/pull/106)


### 🏠 Chores
* bump version to 1.0.0-rc.6 by @github-actions[bot]
* minor parsing improvements by @Brentlok


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0-rc.5...v1.0.0-rc.6## What's Changed in 1.0.0-rc.5



### 🚀 Features
* feat: useCSSVariable hook by @Brentlok in [#103](https://github.com/uni-stack/uniwind/pull/103)
* add reactive has adaptive themes by @jpudysz
* preserve component prototype chain when copying properties in uniwind utils by @jpudysz


### 🐛 Bug Fixes
* fix: keep css code on web, and dont always recreate uniwind files by @Brentlok in [#101](https://github.com/uni-stack/uniwind/pull/101)
* fix: improve matching units regex in tryEval by @Brentlok in [#97](https://github.com/uni-stack/uniwind/pull/97)


### 🏠 Chores
* bump version to 1.0.0-rc.5 by @github-actions[bot]
* revert uniwind.css by @jpudysz


### 📦 Other
* feat: add reactive has adaptive themes by @jpudysz in [#104](https://github.com/uni-stack/uniwind/pull/104)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0-rc.4...v1.0.0-rc.5## What's Changed in 1.0.0-rc.4



### 🚀 Features
* add cache to metro-transformer by @Brentlok
* add support for windows builds by @jpudysz
* feat: major vars refactor to resolve vars using another vars by @Brentlok in [#90](https://github.com/uni-stack/uniwind/pull/90)
* feat: metro transformer and patch bare metro by @Brentlok in [#87](https://github.com/uni-stack/uniwind/pull/87)


### 🐛 Bug Fixes
* fix: useResolveClassName on web collect styles that were affected by className by @Brentlok in [#88](https://github.com/uni-stack/uniwind/pull/88)


### 🏠 Chores
* bump version to 1.0.0-rc.4 by @github-actions[bot]
* support cursor css by @Brentlok
* display for what className there are unsupported css values by @Brentlok


### 📦 Other
* feat: add support for windows builds by @jpudysz in [#92](https://github.com/uni-stack/uniwind/pull/92)


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0-rc.3...v1.0.0-rc.4## What's Changed in 1.0.0-rc.3



### 🐛 Bug Fixes
* return function instead of promise from withUniwindConfig by @Brentlok


### 🏠 Chores
* bump version to 1.0.0-rc.3 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0-rc.2...v1.0.0-rc.3## What's Changed in 1.0.0-rc.2



### 🐛 Bug Fixes
* fix: some styles parsing after performance improvements by @Brentlok in [#80](https://github.com/uni-stack/uniwind/pull/80)


### 📚 Documentation
* update install command to use uniwind@next instead of beta tag by @jpudysz


### 🏠 Chores
* bump version to 1.0.0-rc.2 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0-rc.1...v1.0.0-rc.2## What's Changed in 1.0.0-rc.1



### 🏠 Chores
* bump version to 1.0.0-rc.1 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0.rc.1...v1.0.0-rc.1## What's Changed in 1.0.0.rc.1



### 🚀 Features
* feat: performance improvements by @Brentlok in [#75](https://github.com/uni-stack/uniwind/pull/75)


### 🐛 Bug Fixes
* always replace inline and block padding and margin by @Brentlok
* bundle virtual files at metro start by @Brentlok
* translate inline to horizontal and block to vertical for better support by @Brentlok
* error caused by changing deps size in withAutoUniwind by @Brentlok


### 🏠 Chores
* bump version to 1.0.0.rc.1 by @github-actions[bot]


**Full Changelog**: https://github.com/uni-stack/uniwind/compare/v1.0.0-beta.8...v1.0.0.rc.1## What's Changed in 1.0.0-beta.8



### 🚀 Features
* feat: add rem polyfill to withUniwindConfig by @Brentlok in [#71](https://github.com/uni-stack/uniwind/pull/71)
* feat: support platform vars by @Brentlok in [#59](https://github.com/uni-stack/uniwind/pull/59)
* feat: support active, focused, disabled by @Brentlok in [#47](https://github.com/uni-stack/uniwind/pull/47)
* parse font variant numeric by @Brentlok
* support percentage length type in units by @Brentlok
* feat: custom css functions by @Brentlok in [#44](https://github.com/uni-stack/uniwind/pull/44)
* support light-dark css function by @Brentlok
* add extraThemes and remove themes by @Brentlok
* support nested media queries by @Brentlok
* support @source by @Brentlok
* support lin-style by @Brentlok
* support hash by @Brentlok
* inject code for web by @Brentlok
* support absolute font-weight by @Brentlok
* feat: metro resolver by @Brentlok in [#36](https://github.com/uni-stack/uniwind/pull/36)
* replace adaptive themes with system theme by @Brentlok
* useUniwind for both platforms by @Brentlok
* generate improved themes on hot reload by @Brentlok
* add useUniwind support by @jpudysz
* auto generate theme variants and types using metro by @Brentlok
* feat: uniwind config by @Brentlok in [#23](https://github.com/uni-stack/uniwind/pull/23)
* listeners based on dependencies by @Brentlok
* support more native components by @Brentlok
* use original color props with higer priority by @Brentlok
* parser improvements by @Brentlok
* simpler box shadow parsing by @Brentlok
* support em by @Brentlok
* feat: withUniwind hoc by @Brentlok in [#22](https://github.com/uni-stack/uniwind/pull/22)
* feat: useResolveClassNames by @Brentlok in [#21](https://github.com/uni-stack/uniwind/pull/21)
* optimize virtual bundling by @Brentlok
* typed withUniwind by @Brentlok
* resolve styles based on complexity by @Brentlok
* improve metro change updates by @Brentlok
* feat: new parser that handles important by @Brentlok in [#20](https://github.com/uni-stack/uniwind/pull/20)
* feat: more css friendly parser by @Brentlok in [#19](https://github.com/uni-stack/uniwind/pull/19)
* process word colors by @Brentlok
* remove postcss, compile tailwind in metro by @Brentlok
* linear gradients by @Brentlok
* support more classes by @Brentlok
* process math functions by @Brentlok
* handle calc by @Brentlok
* update unsupported web accents by @Brentlok
* trackColor and colors by @Brentlok
* feat: separated components by @Brentlok in [#18](https://github.com/uni-stack/uniwind/pull/18)
* feat: useUniwindAccent by @Brentlok in [#17](https://github.com/uni-stack/uniwind/pull/17)
* dependencies by @Brentlok
* feat: unit tests by @Brentlok in [#16](https://github.com/uni-stack/uniwind/pull/16)
* handle % in calc by @Brentlok
* handle css max function by @Brentlok
* feat: parser improvements by @Brentlok in [#15](https://github.com/uni-stack/uniwind/pull/15)
* process transitions by @Brentlok
* handle transforms in parser by @Brentlok
* handle env and time by @Brentlok
* feat: lightning css parser by @Brentlok in [#14](https://github.com/uni-stack/uniwind/pull/14)
* platform resolve by @Brentlok
* resolve nested variants by @Brentlok
* feat: nested variants by @Brentlok in [#11](https://github.com/uni-stack/uniwind/pull/11)
* dir to rtl boolean by @Brentlok
* feat: resolve color-scheme and writing-direction by @Brentlok in [#10](https://github.com/uni-stack/uniwind/pull/10)
* feat: basic dependencies by @Brentlok in [#9](https://github.com/uni-stack/uniwind/pull/9)
* feat: update to expo 54 and create bare RN example by @Brentlok in [#8](https://github.com/uni-stack/uniwind/pull/8)
* feat(metro): handle color-mix alpha by @Brentlok in [#7](https://github.com/uni-stack/uniwind/pull/7)
* feat: css to RN by @Brentlok in [#6](https://github.com/uni-stack/uniwind/pull/6)
* handle local vars by @Brentlok
* multiplatform createUniwindComponent by @Brentlok
* convert css styles to rn by @Brentlok
* dont parse web to rn stylesheets by @Brentlok
* dev hot reload by @Brentlok
* stylesheet and variables computed in runtime by @Brentlok
* convert css to rn by @Brentlok
* breakpoints by @Brentlok
* parse colors by @Brentlok
* babel plugin by @Brentlok
* expo example by @Brentlok
* components by @Brentlok
* virtual module for each platform by @Brentlok
* monorepo by @Brentlok


### 🐛 Bug Fixes
* fix: pass an empty style to rnw when there's not class by @Brentlok in [#60](https://github.com/uni-stack/uniwind/pull/60)
* create empty virtual files by @Brentlok
* dont force pressable Text on native by @Brentlok
* percentage unit calculation by @Brentlok
* setting theme to light doesnt disable adaptive themes by @Brentlok
* hide types for components by @Brentlok
* improve evals by @Brentlok
* no em NaN error by @Brentlok
* withUniwind crash caused because of chaning deps size on native by @Brentlok
* useUniwind theme type by @Brentlok
* dont inject js for web by @Brentlok
* border, padding, margin parsing by @Brentlok
* calc % parsing by @Brentlok
* parse transform origin by @Brentlok
* border styles by @Brentlok
* babel filename check by @Brentlok
* improve parser by @Brentlok
* add cubicBezier empty function to runtime by @Brentlok
* always serialize className to string by @Brentlok
* color mix always in runtime by @Brentlok
* handle colors in function by @Brentlok
* clear rtl and theme when parsing by @Brentlok
* withUniwind styleProperty extend by @Brentlok
* parse borderColor for directions by @Brentlok
* improve withUniwind auto types by @Brentlok
* move rnw styles to rnw layer by @Brentlok
* dont treat numbers as colors by @Brentlok
* parsing loop by @Brentlok
* remove dir if exists by @Brentlok


### 🔨 Refactoring
* separate web and native core's by @Brentlok
* flat vars by @Brentlok


### 📚 Documentation
* add readme to uniwind package by @Brentlok
* docs: readme by @Brentlok in [#53](https://github.com/uni-stack/uniwind/pull/53)


### 🏠 Chores
* bump version to 1.0.0-beta.8 by @github-actions[bot]
* chore: add expo-router example by @needim in [#56](https://github.com/uni-stack/uniwind/pull/56)
* beta7 by @Brentlok
* handle sticky type by @Brentlok
* beta5 by @Brentlok
* update dependencies by @Brentlok
* beta4 release by @Brentlok
* rename default uniwind.d.ts by @Brentlok
* expose withUniwind types by @Brentlok
* minor fixes by @Brentlok
* beta2 by @Brentlok
* rename withUniwind prop to fromClassName by @Brentlok
* remove configure and expose hasAdaptiveThemes by @Brentlok
* add color scheme style dependency by @Brentlok
* rename withUniwindConfig params by @Brentlok
* error when no initial theme by @Brentlok
* build css to uniwind.css by @Brentlok
* dark and light as default themes by @Brentlok
* handle currentColor in color by @Brentlok
* handle more color types by @Brentlok
* trigger theme update on hot reload by @Brentlok
* improve initial uniwind config by @Brentlok
* parse additional colors by @Brentlok
* improve withUniwind types by @Brentlok
* alpha-5 by @Brentlok
* use watcher instead of haste by @Brentlok
* alpha 2 release by @Brentlok
* first alpha release by @Brentlok
* trigger rerender by @Brentlok
* replace css infinity by @Brentlok
* improve checking for computed properties by @Brentlok
* only check for dark dependency by @Brentlok
* reorganize screen dimensions under nested screen object in UniwindRuntime by @jpudysz
* minor improvements by @Brentlok
* fix implementation by @Brentlok
* update native rem to 14 by @Brentlok
* move eslint config by @Brentlok


### 📦 Other
* feat: add useUniwind support by @jpudysz in [#24](https://github.com/uni-stack/uniwind/pull/24)
* Insets by @Brentlok in [#12](https://github.com/uni-stack/uniwind/pull/12)
* chore: reorganize screen dimensions under nested screen object in UniwindRuntime by @jpudysz in [#5](https://github.com/uni-stack/uniwind/pull/5)
* feat(metro): handle local vars by @Brentlok in [#3](https://github.com/uni-stack/uniwind/pull/3)
* feat: multiplatform createUniwindComponent by @Brentlok in [#2](https://github.com/uni-stack/uniwind/pull/2)


### New Contributors
* @github-actions[bot] made their first contribution
* @needim made their first contribution in [#56](https://github.com/uni-stack/uniwind/pull/56)<!-- generated by git-cliff -->
