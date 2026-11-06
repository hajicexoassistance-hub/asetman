import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Check, ChevronDown } from 'lucide-react';

interface OptionItem {
  id?: string;
  label: string;
  subLabel?: string;
  data?: any;
}

interface SearchableSelectWithAddProps {
  label: string;
  options: OptionItem[];
  value: string;
  onChange: (value: string, selectedItem?: any) => void;
  onAddNew: (query: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const SearchableSelectWithAdd: React.FC<SearchableSelectWithAddProps> = ({
  label,
  options,
  value,
  onChange,
  onAddNew,
  placeholder = 'Ketik untuk cari atau tambah...',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase()) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(query.toLowerCase()))
  );

  const exactMatch = options.some((opt) => opt.label.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[11px] font-semibold text-[#7F8C8D] block">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div className="relative">
        <div
          onClick={() => setIsOpen(true)}
          className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-xs text-[#2C3E50] flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#2D7D62]"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              onChange(e.target.value);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent focus:outline-none font-medium text-xs text-[#2C3E50]"
          />
          <ChevronDown className="w-4 h-4 text-[#7F8C8D] shrink-0 ml-1" />
        </div>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#e2e6e4] rounded-xl shadow-xl max-h-56 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={`opt-${idx}`}
                  onClick={() => {
                    setQuery(opt.label);
                    onChange(opt.label, opt.data);
                    setIsOpen(false);
                  }}
                  className="px-3 py-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-none"
                >
                  <div>
                    <span className="font-semibold text-xs text-[#2C3E50] block">{opt.label}</span>
                    {opt.subLabel && <span className="text-[10px] text-[#7F8C8D]">{opt.subLabel}</span>}
                  </div>
                  {value === opt.label && <Check className="w-4 h-4 text-[#2D7D62]" />}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-[#7F8C8D]">Tidak ditemukan.</div>
            )}

            {query.trim() && !exactMatch && (
              <div
                onClick={() => {
                  onAddNew(query.trim());
                  onChange(query.trim());
                  setIsOpen(false);
                }}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-[#2D7D62] font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 border-t border-emerald-200 sticky bottom-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah "{query.trim()}" ke Master Data</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
