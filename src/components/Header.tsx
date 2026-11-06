import React from 'react';
import { Database, RefreshCw, Search, X, Building2, Camera } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  gasUrl: string;
  onOpenGasModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  userRole: UserRole;
  assignedUnit: string;
  onOpenScanner?: () => void;
  activeTab?: string;
  isAuditViewActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gasUrl,
  onOpenGasModal,
  onRefresh,
  isLoading,
  searchQuery,
  onSearchChange,
  userRole,
  assignedUnit,
  onOpenScanner,
  activeTab,
  isAuditViewActive,
}) => {
  const isConnected = Boolean(gasUrl && gasUrl.trim().length > 0);
  const showSearchRow = Boolean(
    isAuditViewActive || ['assets', 'pos', 'archive'].includes(activeTab || '')
  );

  return (
    <header className={`sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#F2F4F3] px-3 sm:px-4 transition-all shadow-xs ${
      showSearchRow ? 'py-2' : 'py-1.5'
    }`}>
      <div className="flex flex-col gap-1.5 max-w-7xl mx-auto">
        {/* Top Row: Brand & System Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Lockup */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7.5 h-7.5 rounded-xl bg-[#2D7D62] flex items-center justify-center text-white shadow-sm shadow-[#2D7D62]/20 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-[#2C3E50] truncate">
                Assets Management
              </h1>
              <p className="text-[10px] text-[#7F8C8D] font-medium truncate flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#2D7D62] shrink-0" />
                <span>{userRole === 'Admin' ? 'Semua Unit (Admin)' : assignedUnit}</span>
              </p>
            </div>
          </div>

          {/* Controls: Connection & Refresh */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 bg-[#A8E6CF] text-[#2D7D62] text-[10px] font-bold rounded-md shrink-0">
              {userRole}
            </span>

            <button
              type="button"
              onClick={onOpenGasModal}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                isConnected
                  ? 'bg-[#A8E6CF]/40 text-[#2D7D62] border-[#2D7D62]/30'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isConnected ? 'Google Sheets: Tersambung' : 'Google Sheets: Belum tersambung'}
            >
              <Database className="w-3.5 h-3.5" />
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#2D7D62]' : 'bg-amber-500 animate-pulse'}`} />
            </button>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className={`p-1.5 rounded-lg text-[#2C3E50] hover:bg-[#F2F4F3] transition-colors cursor-pointer ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Muat ulang data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Row: Search Bar with Camera Scanner Button (Contextual) */}
        {showSearchRow && (
          <div className="relative flex items-center gap-1.5 animate-in fade-in duration-150">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7F8C8D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari kode aset, nama barang, kategori, unit, S/N..."
                className="w-full bg-[#F2F4F3] text-[#2C3E50] placeholder-[#7F8C8D] border border-[#e2e6e4] rounded-lg pl-8 pr-7 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#2D7D62] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#7F8C8D] hover:text-[#2C3E50]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="p-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white rounded-lg shadow-2xs shrink-0 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                title="Buka Kamera Barcode / QR Scanner"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
