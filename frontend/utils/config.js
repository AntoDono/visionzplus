import getConfig from 'next/config'

// Only holds serverRuntimeConfig and publicRuntimeConfig
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export const config = {
  // Use server config if it exists, otherwise use public config
  openaiApiKey: serverRuntimeConfig.OPENAI_API_KEY || publicRuntimeConfig.OPENAI_API_KEY,
}
