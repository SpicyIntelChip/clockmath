'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Globe, Calculator, History } from 'lucide-react'

interface ToolTab {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  description?: string
}

const tools: ToolTab[] = [
  {
    id: 'calculator',
    label: 'Time Calculator',
    href: '/',
    icon: <Clock className="w-4 h-4" />,
    description: 'Calculate time between two times'
  },
  {
    id: 'timezone',
    label: 'Timezone Converter',
    href: '/tools/timezone',
    icon: <Globe className="w-4 h-4" />,
    description: 'Convert between timezones'
  }
]

interface ToolsNavigationProps {
  currentTool?: string
  showHistory?: boolean
  historyCount?: number
  onHistoryClick?: () => void
  className?: string
}

export default function ToolsNavigation({ 
  currentTool, 
  showHistory = false, 
  historyCount = 0, 
  onHistoryClick,
  className = "" 
}: ToolsNavigationProps) {
  const pathname = usePathname()
  
  // Determine active tool based on pathname if currentTool not provided
  const activeToolId = currentTool || (pathname === '/' ? 'calculator' : 
                      pathname === '/tools/timezone' ? 'timezone' : 'calculator')

  return (
    <div className={`bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-1 shadow-xl border border-border/50 dark:border-slate-700/50 ${className}`}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className={`flex-1 min-w-0 px-3 sm:px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeToolId === tool.id
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tool.icon}
            <span className="hidden sm:inline">{tool.label}</span>
            <span className="sm:hidden">{tool.label.split(' ')[0]}</span>
          </Link>
        ))}
        
        {showHistory && (
          <button
            onClick={onHistoryClick}
            className={`flex-1 min-w-0 px-3 sm:px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              currentTool === 'history'
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Recent Calculations</span>
            <span className="sm:hidden">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-xs rounded-full min-w-[1.25rem] text-center">
                {historyCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
