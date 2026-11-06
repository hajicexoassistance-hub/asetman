import React from 'react';
import { LayoutDashboard, Boxes, ShoppingCart, FileText, Settings } from 'lucide-react';

export type TabType = 'dashboard' | 'assets' | 'pos' | 'archive' | 'settings';

interface BottomNavProps {
  activeTab: TabType | string;
  isAuditViewActive?: boolean;
  onTabChange: (tab: TabType) => void;
  onOpenActionHub?: () => void;
  pendingAuditCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  isAuditViewActive = false,
  onTabChange,
}) => {
  const isDashboardActive = activeTab === 'dashboard' && !isAuditViewActive;
  const isAssetsActive = activeTab === 'assets' && !isAuditViewActive;
  const isPosActive = activeTab === 'pos' && !isAuditViewActive;
  const isArchiveActive = activeTab === 'archive' && !isAuditViewActive;
  const isSettingsActive = activeTab === 'settings' && !isAuditViewActive;

  return (
    <nav className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border-t border-[#F2F4F3] transition-colors pb-safe shadow-lg">
      <div className="grid grid-cols-5 items-center w-full h-16 px-1 max-w-xl mx-auto relative">
        {/* 1. Beranda Tab */}
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center relative h-full transition-all cursor-pointer ${
            isDashboardActive ? 'text-[#2D7D62] font-bold' : 'text-[#7F8C8D] hover:text-[#2C3E50] font-medium'
          }`}
        >
          {isDashboardActive && <span className="absolute top-0 w-6 h-1 bg-[#2D7D62] rounded-b-full transition-all" />}
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Beranda</span>
        </button>

        {/* 2. Aset Tab (Stok & SO) */}
        <button
          type="button"
          onClick={() => onTabChange('assets')}
          className={`flex flex-col items-center justify-center relative h-full transition-all cursor-pointer ${
            isAssetsActive ? 'text-[#2D7D62] font-bold' : 'text-[#7F8C8D] hover:text-[#2C3E50] font-medium'
          }`}
        >
          {isAssetsActive && <span className="absolute top-0 w-6 h-1 bg-[#2D7D62] rounded-b-full transition-all" />}
          <Boxes className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Aset</span>
        </button>

        {/* 3. POS Tab (Store-style POS) */}
        <button
          type="button"
          onClick={() => onTabChange('pos')}
          className={`flex flex-col items-center justify-center relative h-full transition-all cursor-pointer ${
            isPosActive ? 'text-[#2D7D62] font-bold' : 'text-[#7F8C8D] hover:text-[#2C3E50] font-medium'
          }`}
        >
          {isPosActive && <span className="absolute top-0 w-6 h-1 bg-[#2D7D62] rounded-b-full transition-all" />}
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">POS</span>
        </button>

        {/* 4. Arsip BA Vault Tab */}
        <button
          type="button"
          onClick={() => onTabChange('archive')}
          className={`flex flex-col items-center justify-center relative h-full transition-all cursor-pointer ${
            isArchiveActive ? 'text-[#2D7D62] font-bold' : 'text-[#7F8C8D] hover:text-[#2C3E50] font-medium'
          }`}
        >
          {isArchiveActive && <span className="absolute top-0 w-6 h-1 bg-[#2D7D62] rounded-b-full transition-all" />}
          <FileText className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Arsip BA</span>
        </button>

        {/* 5. Setelan Tab (Includes Master Data) */}
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center relative h-full transition-all cursor-pointer ${
            isSettingsActive ? 'text-[#2D7D62] font-bold' : 'text-[#7F8C8D] hover:text-[#2C3E50] font-medium'
          }`}
        >
          {isSettingsActive && <span className="absolute top-0 w-6 h-1 bg-[#2D7D62] rounded-b-full transition-all" />}
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Setelan</span>
        </button>
      </div>
    </nav>
  );
};
