import { liangmi } from '@liangmi/vp-config'

export default await liangmi({
  // Built separately, so each entry gets its own copy of the code and types.
  pack: [
    { entry: './src/index.ts' },
    {
      entry: './src/vite-plus.ts',
      clean: false,
      // Vite+ users may not install `oxlint`, so types come from the copies Vite+ and the core's Vite+ entry re-export.
      outputOptions: {
        paths: { oxlint: 'vite-plus/lint', 'oxlint-flat-config': 'oxlint-flat-config/vite-plus' }
      }
    }
  ]
})
