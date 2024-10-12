import { PluginID } from "@/types/plugins"

export const getFreePlugins = (): PluginID[] => [
  PluginID.CVE_MAP,
  PluginID.SUBDOMAIN_FINDER,
  PluginID.WAF_DETECTOR,
  PluginID.WHOIS_LOOKUP,
  PluginID.DNS_SCANNER,
  PluginID.PORT_SCANNER
]

export const getTerminalPlugins = (): PluginID[] => [
  PluginID.SQLI_EXPLOITER,
  PluginID.SSL_SCANNER,
  PluginID.DNS_SCANNER,
  PluginID.PORT_SCANNER,
  PluginID.WAF_DETECTOR,
  PluginID.WHOIS_LOOKUP,
  PluginID.SUBDOMAIN_FINDER,
  PluginID.CVE_MAP,
  PluginID.URL_FUZZER,
  PluginID.WORDPRESS_SCANNER,
  PluginID.XSS_EXPLOITER,
  PluginID.TERMINAL
]

export const isFreePlugin = (plugin: PluginID): boolean =>
  getFreePlugins().includes(plugin)

export const isTerminalPlugin = (plugin: PluginID): boolean =>
  getTerminalPlugins().includes(plugin)

export const getTerminalTemplate = (plugin: PluginID): string => {
  if (plugin === PluginID.URL_FUZZER) {
    return "terminal-fuzzing"
  }
  return isFreePlugin(plugin) ? "terminal-for-free-tools" : "terminal-for-tools"
}
