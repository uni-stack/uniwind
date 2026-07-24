declare module 'remoteA/Panel' {
    import type { ComponentType } from 'react'

    const RemotePanel: ComponentType<{ revision: string }>
    export default RemotePanel
}

declare module 'remoteB/Panel' {
    import type { ComponentType } from 'react'

    const RemotePanel: ComponentType<{ revision: string }>
    export default RemotePanel
}
