import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  House, 
  Package, 
  CreditCard, 
  Users, 
  Gear,
  List,
  X
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useKV('sidebar-active', 'dashboard')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: House },
    { id: 'wms', label: 'WMS', icon: Package },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'settings', label: 'Settings', icon: Gear },
  ]

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Collab3PL</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X size={20} />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeItem === item.id ? "default" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => {
                  setActiveItem(item.id)
                  onClose()
                }}
              >
                <Icon size={20} />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [user] = useKV('current-user', { name: 'Admin User', email: 'admin@collab3pl.com' })

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <List size={20} />
      </Button>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Welcome back,</span>
        <span className="font-medium text-foreground">{user.name}</span>
        <Button variant="outline" size="sm">
          Log Out
        </Button>
      </div>
    </header>
  )
}

function DashboardContent() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your command center</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Gear className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Package size={20} className="text-accent" />
              <div>
                <p className="font-medium">New order received</p>
                <p className="text-sm text-muted-foreground">Order #12345 from Acme Corp</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <CreditCard size={20} className="text-primary" />
              <div>
                <p className="font-medium">Invoice generated</p>
                <p className="text-sm text-muted-foreground">INV-2024-001 for $2,450</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Users size={20} className="text-secondary-foreground" />
              <div>
                <p className="font-medium">New client onboarded</p>
                <p className="text-sm text-muted-foreground">TechStart Inc. - Full service agreement</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main>
          <DashboardContent />
        </main>
      </div>
    </div>
  )
}