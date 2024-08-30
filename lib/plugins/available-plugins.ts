import { PluginID, pluginUrls, PluginSummary } from "@/types/plugins"

export const availablePlugins: PluginSummary[] = [
  {
    id: 0,
    name: "None",
    selectorName: "No plugin selected",
    value: PluginID.NONE,
    categories: [],
    isInstalled: false,
    isPremium: false,
    createdAt: "2023-01-01",
    starters: [
      {
        title: "Explain How To",
        description: "identify and exploit XSS vulnerabilities",
        chatMessage: "Explain how to identify and exploit XSS vulnerabilities."
      },
      {
        title: "Explain How To",
        description: "identify information disclosure vulnerabilities",
        chatMessage:
          "Explain how to identify information disclosure vulnerabilities."
      },
      {
        title: "Provide General Methodology",
        description: "for file upload vulnerabilities",
        chatMessage:
          "Provide General Methodology for file upload vulnerabilities."
      },
      {
        title: "Provide Techniques",
        description: "to bypass rate limit",
        chatMessage: "Provide techniques to bypass rate limit."
      }
    ]
  },
  {
    id: 3,
    name: "CVEMap",
    selectorName: "CVEMap",
    value: PluginID.CVEMAP,
    categories: [],
    icon: "https://avatars.githubusercontent.com/u/50994705",
    description: "Navigate the CVE jungle with ease",
    githubRepoUrl: pluginUrls.CVEMAP,
    isInstalled: false,
    isPremium: false,
    createdAt: "2024-03-13",
    starters: [
      {
        title: "Provide Me With",
        description: "the latest CVEs with the severity of critical",
        chatMessage:
          "Provide me with the latest CVEs with the severity of critical."
      },
      {
        title: "Provide Me With",
        description: "the CVEs for Microsoft that have nuclei templates",
        chatMessage:
          "Provide me with the CVEs for Microsoft that have nuclei templates."
      },
      {
        title: "Provide Information About",
        description: "CVE-2024-23897 (critical LFI in Jenkins)",
        chatMessage:
          "Provide information about CVE-2024-23897 (critical LFI in Jenkins)."
      },
      {
        title: "CVEMap Help",
        description: "How does the CVEMap plugin work?",
        chatMessage: "/cvemap -help"
      }
    ]
  },
  {
    id: 4,
    name: "Subdomain Finder",
    selectorName: "Subdomain Finder",
    categories: ["recon"],
    value: PluginID.SUBFINDER,
    icon: "https://cdn-icons-png.flaticon.com/128/3138/3138297.png",
    invertInDarkMode: true,
    description: "Discover subdomains of a domain",
    githubRepoUrl: pluginUrls.SUBFINDER,
    isInstalled: false,
    isPremium: false,
    createdAt: "2024-02-27",
    starters: [
      {
        title: "Start Subdomain Discovery",
        description: "for bugcrowd.com",
        chatMessage: "Start subdomain discovery for bugcrowd.com"
      },
      {
        title: "Scan For Active-Only",
        description: "subdomains of hackthebox.com",
        chatMessage: "Scan for active-only subdomains of hackthebox.com"
      },
      {
        title: "Scan For Subdomains",
        description: "of intigriti.com including their host IPs",
        chatMessage:
          "Scan for subdomains of intigriti.com including their host IPs."
      },
      {
        title: "Subfinder Help",
        description: "How does the Subfinder plugin work?",
        chatMessage: "/subfinder -help"
      }
    ]
  },
  {
    id: 5,
    name: "Link Finder",
    selectorName: "Link Finder",
    value: PluginID.LINKFINDER,
    categories: ["recon"],
    icon: "https://cdn-icons-png.flaticon.com/128/9465/9465808.png",
    invertInDarkMode: true,
    description: "Fast and minimal JS endpoint extractor",
    githubRepoUrl: pluginUrls.LINKFINDER,
    isInstalled: false,
    isPremium: false,
    createdAt: "2024-03-26",
    starters: [
      {
        title: "Extract URLs",
        description: "from https://www.hackerone.com/product/...",
        chatMessage:
          "Extract URLs from https://www.hackerone.com/product/overview"
      },
      {
        title: "Link Finder Help",
        description: "How does the Link Finder plugin work?",
        chatMessage: "/linkfinder -help"
      }
    ]
  },
  {
    id: 6,
    name: "Enhanced Search",
    selectorName: "Enhanced Search",
    value: PluginID.ENHANCED_SEARCH,
    categories: [],
    icon: "https://cdn-icons-png.flaticon.com/128/11751/11751689.png",
    invertInDarkMode: true,
    description:
      "Enhances the model with curated PentestGPT knowledge, including popular guides, techniques, and tools",
    githubRepoUrl: pluginUrls.PENTESTGPT,
    isInstalled: false,
    isPremium: false,
    createdAt: "2024-07-26",
    starters: [
      {
        title: "What are Some Ways",
        description: "to bypass payment process?",
        chatMessage: "What are some ways to bypass payment process?"
      },
      {
        title: "Explain the OWASP Top 10",
        description: "and how to test for them",
        chatMessage: "Explain the OWASP Top 10 and how to test for them."
      },
      {
        title: "Describe Common Techniques",
        description: "for exploiting server-side request forgery",
        chatMessage:
          "Describe common techniques for exploiting server-side request forgery."
      },
      {
        title: "List Popular Vulnerabel",
        description: "ports to exploit",
        chatMessage: "List popular vulnerabel ports to exploit."
      }
    ]
  },
  {
    id: 7,
    name: "Nuclei",
    selectorName: "Nuclei",
    value: PluginID.NUCLEI,
    categories: ["vuln-scanners"],
    icon: "https://avatars.githubusercontent.com/u/50994705",
    description: "Fast and customisable vulnerability scanner",
    githubRepoUrl: pluginUrls.NUCLEI,
    isInstalled: false,
    isPremium: true,
    createdAt: "2024-02-27",
    starters: [
      {
        title: "Start Vulnerability Scan",
        description: "for hackerone.com with a focus on cves and osint",
        chatMessage:
          "Start vulnerability scan for hackerone.com with a focus on cves and osint."
      },
      {
        title: "Initiate Web Tech Detection Scan",
        description: "on hackerone.com",
        chatMessage: "/nuclei -u hackerone.com -tags tech"
      },
      {
        title: "Perform Automatic Scan",
        description: "for hackerone.com",
        chatMessage: "/nuclei -target hackerone.com -automatic-scan"
      },
      {
        title: "Nuclei Help",
        description: "How does the Nuclei plugin work?",
        chatMessage: "/nuclei -help"
      }
    ]
  },
  {
    id: 8,
    name: "Katana",
    selectorName: "Katana",
    value: PluginID.KATANA,
    categories: ["recon"],
    icon: "https://avatars.githubusercontent.com/u/50994705",
    description:
      "Web crawling framework designed to navigate and parse for hidden details",
    githubRepoUrl: pluginUrls.KATANA,
    isInstalled: false,
    isPremium: true,
    createdAt: "2024-02-27",
    starters: [
      {
        title: "Crawl With JavaScript Parsing",
        description: "for dynamic content on hackerone.com",
        chatMessage: "/katana -u hackerone.com -js-crawl"
      },
      {
        title: "Perform Scope-Defined Crawling",
        description: "on hackerone.com",
        chatMessage: "/katana -u hackerone.com -crawl-scope '.*hackerone.com*'"
      },
      {
        title: "Filter Content by Extension",
        description: "on target.com, excluding CSS and PNG",
        chatMessage: "/katana -u hackerone.com -extension-filter png,css"
      },
      {
        title: "Katana Help",
        description: "How does the Katana plugin work?",
        chatMessage: "/katana -help"
      }
    ]
  },
  {
    id: 10,
    name: "Port Scanner",
    selectorName: "Port Scanner",
    value: PluginID.PORTSCANNER,
    categories: ["recon"],
    icon: "https://cdn-icons-png.flaticon.com/128/7338/7338907.png",
    invertInDarkMode: true,
    description: "Detect open ports and fingerprint services",
    githubRepoUrl: pluginUrls.PORTSCANNER,
    isInstalled: false,
    isPremium: true,
    createdAt: "2024-06-29",
    starters: [
      {
        title: "Perform Light Port Scan",
        description: "on hackerone.com (top 100 ports)",
        chatMessage: "Perform a light port scan on hackerone.com"
      },
      {
        title: "Scan Specific Ports",
        description: "80, 443, 8080 on hackerone.com and subdomains",
        chatMessage:
          "Scan ports 80, 443, and 8080 on hackerone.com and its subdomains: api.hackerone.com, docs.hackerone.com, resources.hackerone.com, gslink.hackerone.com"
      },
      {
        title: "Conduct Deep Port Scan",
        description: "on hackerone.com (top 1000 ports)",
        chatMessage: "Conduct a deep port scan on hackerone.com"
      },
      {
        title: "Port Scanner Help",
        description: "Display usage instructions and available options",
        chatMessage: "/portscanner -help"
      }
    ]
  },
  {
    id: 11,
    name: "DNS Scanner",
    selectorName: "DNS Scanner",
    value: PluginID.DNSSCANNER,
    categories: ["vuln-scanners"],
    icon: "https://cdn-icons-png.flaticon.com/128/1183/1183697.png",
    invertInDarkMode: true,
    description:
      "Perform DNS recon and discover misconfigurations in DNS servers",
    githubRepoUrl: pluginUrls.DNSSCANNER,
    isInstalled: false,
    isPremium: true,
    createdAt: "2024-08-05",
    starters: [
      {
        title: "Enumerate DNS Records",
        description: "for owasp.org",
        chatMessage: "Enumerate DNS Records for owasp.org"
      },
      {
        title: "Attempt Zone Transfer",
        description: "on tryhackme.com",
        chatMessage: "Attempt Zone Transfer on tryhackme.com"
      },
      {
        title: "DNS Scanner Help",
        description: "Display usage instructions and available options",
        chatMessage: "/dnsscanner -help"
      }
    ]
  },
  {
    id: 12,
    name: "SQLi Exploiter",
    selectorName: "SQLi Exploiter",
    value: PluginID.SQLIEXPLOITER,
    categories: ["vuln-scanners"],
    icon: "https://cdn-icons-png.flaticon.com/128/6843/6843633.png",
    invertInDarkMode: true,
    description: "Exploit SQL injection in web apps to extract data",
    githubRepoUrl: pluginUrls.SQLIEXPLOITER,
    isInstalled: false,
    isPremium: true,
    createdAt: "2024-07-18",
    starters: [
      {
        title: "Perform Basic SQLi Scan",
        description: "on testphp.vulnweb.com search page",
        chatMessage:
          "Perform a basic SQLi scan on http://testphp.vulnweb.com/search.php?test=1"
      },
      {
        title: "Conduct Advanced SQLi Analysis",
        description: "using all techniques with elevated risk",
        chatMessage:
          "Conduct an advanced SQLi analysis on http://testphp.vulnweb.com/search.php?test=1 using all techniques and risk level 2"
      },
      {
        title: "Execute Deep SQLi Scan",
        description: "with crawling and evasion techniques",
        chatMessage:
          "Execute a deep SQLi scan on http://testphp.vulnweb.com/search.php?test=1 with crawling enabled, using space2comment evasion, and level 3 testing"
      },
      {
        title: "SQLi Exploiter Help",
        description: "Display usage instructions and available options",
        chatMessage: "/sqliexploiter -help"
      }
    ]
  },
  {
    id: 14,
    name: "SSL/TLS Scanner",
    selectorName: "SSL/TLS Scanner",
    value: PluginID.SSLSCANNER,
    categories: ["vuln-scanners"],
    icon: "https://cdn-icons-png.flaticon.com/128/1034/1034605.png",
    invertInDarkMode: true,
    description:
      "Find SSL/TLS issues like POODLE, Heartbleed, DROWN, ROBOT, etc",
    githubRepoUrl: pluginUrls.SSLSCANNER,
    isInstalled: false,
    isPremium: true,
    createdAt: "2024-07-11",
    starters: [
      {
        title: "Perform Quick SSL/TLS Scan",
        description: "of hackerone.com (port 443 only)",
        chatMessage: "Perform a quick SSL/TLS scan on hackerone.com"
      },
      {
        title: "Conduct a Deep SSL/TLS Scan",
        description: "on bugcrowd.com (top 1000 ports)",
        chatMessage: "Conduct a deep SSL/TLS scan on bugcrowd.com"
      },
      {
        title: "Scan SSL/TLS on Ports",
        description: "443 and 8443 of intigriti.com",
        chatMessage: "Scan SSL/TLS on ports 443 and 8443 of intigriti.com"
      },
      {
        title: "SSL/TLS Scanner Help",
        description: "Display usage instructions and available options",
        chatMessage: "/sslscanner -help"
      }
    ]
  },
  {
    id: 15,
    name: "WAF Detector",
    selectorName: "WAF Detector",
    value: PluginID.WAFDETECTOR,
    categories: ["recon"],
    icon: "https://cdn-icons-png.flaticon.com/128/6993/6993518.png",
    invertInDarkMode: true,
    description: "Fingerprint the Web Application Firewall behind target app",
    githubRepoUrl: pluginUrls.WAFDETECTOR,
    isInstalled: false,
    isPremium: false,
    createdAt: "2024-08-03",
    starters: [
      {
        title: "Detect the WAF",
        description: "used by hackerone.com",
        chatMessage: "Detect the WAF used by hackerone.com"
      },
      {
        title: "WAF Detector Help",
        description: "How does the WAF Detector plugin work?",
        chatMessage: "/wafdetector -help"
      }
    ]
  },
  {
    id: 18,
    name: "Whois Lookup",
    selectorName: "Whois Lookup",
    categories: [],
    value: PluginID.WHOIS,
    icon: "https://cdn-icons-png.flaticon.com/128/15226/15226100.png",
    invertInDarkMode: true,
    description:
      "Retrieve ownership and registration details for domains and IP addresses",
    githubRepoUrl: pluginUrls.WHOIS,
    isInstalled: false,
    isPremium: false,
    createdAt: "2024-07-28",
    starters: [
      {
        title: "Domain Whois Lookup",
        description: "for owasp.org",
        chatMessage: "Perform a Whois lookup for owasp.org"
      },
      {
        title: "Check Registration Info",
        description: "of hackerone.com",
        chatMessage: "Check the registration information for hackerone.com"
      },
      {
        title: "IP Address Whois Lookup",
        description: "for 8.8.8.8",
        chatMessage: "Perform a Whois lookup for IP address 8.8.8.8"
      },
      {
        title: "Whois Lookup Help",
        description: "How does the Whois Lookup plugin work?",
        chatMessage: "/whois -help"
      }
    ]
  },
  {
    id: 99,
    name: "Plugins Store",
    selectorName: "Plugins Store",
    categories: [],
    value: PluginID.PLUGINS_STORE,
    isInstalled: false,
    isPremium: false,
    createdAt: "2023-01-01",
    starters: []
  }
]

export const generalPlugins = [
  {
    name: "websearch",
    priority: "Low",
    description:
      "Information retrieval tool accessing a pre-indexed web dataset. Provides data from periodically crawled web pages, which may be days to months old. Best used for recent/real-time information needs.",
    usageScenarios: [
      "Researching recent/current cybersecurity trends",
      "Gathering information on recent developments in AI",
      "Exploring established tech industry innovations"
    ]
  },
  {
    name: "basellm",
    priority: "High",
    description:
      "Handles a wide range of tasks and provides comprehensive information on various fields, including cybersecurity and programming. Uses the base language model's extensive knowledge for queries that don't require real-time data or specialized tools.",
    usageScenarios: [
      "Answering general and specific knowledge questions on established topics",
      "Providing detailed explanations, methodologies, and code examples for technical concepts",
      "Assisting with tasks that require in-depth understanding of cybersecurity, programming, or other technical fields"
    ]
  }
]
