import { liangmi } from '@liangmi/vp-config'

export default await liangmi({
  test: {
    typecheck: {
      enabled: true
    }
  },
  // Built separately, so each entry gets its own copy of the code and types.
  pack: [
    { entry: './src/index.ts' },
    {
      entry: './src/vite-plus.ts',
      clean: false,
      // Vite+ users may not install `oxlint`, so its types come from the copy Vite+ re-exports.
      outputOptions: { paths: { oxlint: 'vite-plus/lint' } }
    }
  ]
})
