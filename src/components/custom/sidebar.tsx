'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Shield, 
  Users, 
  Video, 
  Activity, 
  MessageSquare, 
  DollarSign,
  Stethoscope
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Painel do Doutor',
    href: '/admin/doctor-panel',
    icon: Stethoscope,
  },
  {
    title: 'Usuários',
    href: '/admin/dashboard?tab=users',
    icon: Users,
  },
  {
    title: 'Doutores',
    href: '/admin/dashboard?tab=doctors',
    icon: Shield,
  },
  {
    title: 'Vídeos',
    href: '/admin/dashboard?tab=videos',
    icon: Video,
  },
  {
    title: 'Atividades',
    href: '/admin/dashboard?tab=activities',
    icon: Activity,
  },
  {
    title: 'Comentários',
    href: '/admin/dashboard?tab=comments',
    icon: MessageSquare,
  },
  {
    title: 'Faturas',
    href: '/admin/dashboard?tab=invoices',
    icon: DollarSign,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn('w-64 bg-slate-800/50 border-r border-purple-500/20 backdrop-blur-sm min-h-screen', className)}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Menu Admin</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
                           (item.href.includes('?tab=') && pathname === '/admin/dashboard');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
