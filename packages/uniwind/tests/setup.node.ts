import module from 'node:module'

// Tailwind's optional Node loader hooks cannot run inside Jest's module sandbox.
Object.defineProperties(module, {
    register: { value: undefined },
    registerHooks: { value: undefined },
})
