import 'mf:init-host'

import { withAsyncStartup } from '@module-federation/metro/bootstrap'
import { registerRootComponent } from 'expo'

// Expo installs its generic split loader while importing registerRootComponent.
// Install MF's loader afterwards so remote bundles use the federated registry.
require('mf:async-require')

registerRootComponent(
    withAsyncStartup(
        () => require('./src/App'),
        () => require('./src/Fallback'),
    )(),
)
