import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';

interface Country {
  name: string;
  code: string;
  dial: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { name: "Afghanistan", code: "AF", dial: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "AL", dial: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "DZ", dial: "+213", flag: "🇩🇿" },
  { name: "Andorra", code: "AD", dial: "+376", flag: "🇦🇩" },
  { name: "Angola", code: "AO", dial: "+244", flag: "🇦🇴" },
  { name: "Anguilla", code: "AI", dial: "+1264", flag: "🇦🇮" },
  { name: "Argentina", code: "AR", dial: "+54", flag: "🇦🇷" },
  { name: "Armenia", code: "AM", dial: "+374", flag: "🇦🇲" },
  { name: "Aruba", code: "AW", dial: "+297", flag: "🇦🇼" },
  { name: "Australia", code: "AU", dial: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "AT", dial: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "AZ", dial: "+994", flag: "🇦🇿" },
  { name: "Bahamas", code: "BS", dial: "+1242", flag: "🇧🇸" },
  { name: "Bahrain", code: "BH", dial: "+973", flag: "🇧🇭" },
  { name: "Bangladesh", code: "BD", dial: "+880", flag: "🇧🇩" },
  { name: "Barbados", code: "BB", dial: "+1246", flag: "🇧🇧" },
  { name: "Belarus", code: "BY", dial: "+375", flag: "🇧🇾" },
  { name: "Belgium", code: "BE", dial: "+32", flag: "🇧🇪" },
  { name: "Belize", code: "BZ", dial: "+501", flag: "🇧🇿" },
  { name: "Benin", code: "BJ", dial: "+229", flag: "🇧🇯" },
  { name: "Bolivia", code: "BO", dial: "+591", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", code: "BA", dial: "+387", flag: "🇧🇦" },
  { name: "Botswana", code: "BW", dial: "+267", flag: "🇧🇼" },
  { name: "Brazil", code: "BR", dial: "+55", flag: "🇧🇷" },
  { name: "Bulgaria", code: "BG", dial: "+359", flag: "🇧🇬" },
  { name: "Burkina Faso", code: "BF", dial: "+226", flag: "🇧🇫" },
  { name: "Cambodia", code: "KH", dial: "+855", flag: "🇰🇭" },
  { name: "Cameroon", code: "CM", dial: "+237", flag: "🇨🇲" },
  { name: "Canada", code: "CA", dial: "+1", flag: "🇨🇦" },
  { name: "Chile", code: "CL", dial: "+56", flag: "🇨🇱" },
  { name: "China", code: "CN", dial: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "CO", dial: "+57", flag: "🇨🇴" },
  { name: "Costa Rica", code: "CR", dial: "+506", flag: "🇨🇷" },
  { name: "Croatia", code: "HR", dial: "+385", flag: "🇭🇷" },
  { name: "Cuba", code: "CU", dial: "+53", flag: "🇨🇺" },
  { name: "Cyprus", code: "CY", dial: "+357", flag: "🇨🇾" },
  { name: "Czech Republic", code: "CZ", dial: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "DK", dial: "+45", flag: "🇩🇰" },
  { name: "Dominican Republic", code: "DO", dial: "+1", flag: "🇩🇴" },
  { name: "Ecuador", code: "EC", dial: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "EG", dial: "+20", flag: "🇪🇬" },
  { name: "El Salvador", code: "SV", dial: "+503", flag: "🇸🇻" },
  { name: "Estonia", code: "EE", dial: "+372", flag: "🇪🇪" },
  { name: "Ethiopia", code: "ET", dial: "+251", flag: "🇪🇹" },
  { name: "Finland", code: "FI", dial: "+358", flag: "🇫🇮" },
  { name: "France", code: "FR", dial: "+33", flag: "🇫🇷" },
  { name: "Georgia", code: "GE", dial: "+995", flag: "🇬🇪" },
  { name: "Germany", code: "DE", dial: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "GH", dial: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "GR", dial: "+30", flag: "🇬🇷" },
  { name: "Guatemala", code: "GT", dial: "+502", flag: "🇬🇹" },
  { name: "Guinea", code: "GN", dial: "+224", flag: "🇬🇳" },
  { name: "Haiti", code: "HT", dial: "+509", flag: "🇭🇹" },
  { name: "Honduras", code: "HN", dial: "+504", flag: "🇭🇳" },
  { name: "Hong Kong", code: "HK", dial: "+852", flag: "🇭🇰" },
  { name: "Hungary", code: "HU", dial: "+36", flag: "🇭🇺" },
  { name: "Iceland", code: "IS", dial: "+354", flag: "🇮🇸" },
  { name: "India", code: "IN", dial: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "ID", dial: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "IR", dial: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "IQ", dial: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "IE", dial: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "IL", dial: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "IT", dial: "+39", flag: "🇮🇹" },
  { name: "Jamaica", code: "JM", dial: "+1876", flag: "🇯🇲" },
  { name: "Japan", code: "JP", dial: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "JO", dial: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "KZ", dial: "+7", flag: "🇰🇿" },
  { name: "Kenya", code: "KE", dial: "+254", flag: "🇰🇪" },
  { name: "Kuwait", code: "KW", dial: "+965", flag: "🇰🇼" },
  { name: "Latvia", code: "LV", dial: "+371", flag: "🇱🇻" },
  { name: "Lebanon", code: "LB", dial: "+961", flag: "🇱🇧" },
  { name: "Libya", code: "LY", dial: "+218", flag: "🇱🇾" },
  { name: "Lithuania", code: "LT", dial: "+370", flag: "🇱🇹" },
  { name: "Luxembourg", code: "LU", dial: "+352", flag: "🇱🇺" },
  { name: "Malaysia", code: "MY", dial: "+60", flag: "🇲🇾" },
  { name: "Maldives", code: "MV", dial: "+960", flag: "🇲🇻" },
  { name: "Mali", code: "ML", dial: "+223", flag: "🇲🇱" },
  { name: "Malta", code: "MT", dial: "+356", flag: "🇲🇹" },
  { name: "Mexico", code: "MX", dial: "+52", flag: "🇲🇽" },
  { name: "Moldova", code: "MD", dial: "+373", flag: "🇲🇩" },
  { name: "Morocco", code: "MA", dial: "+212", flag: "🇲🇦" },
  { name: "Mozambique", code: "MZ", dial: "+258", flag: "🇲🇿" },
  { name: "Myanmar", code: "MM", dial: "+95", flag: "🇲🇲" },
  { name: "Nepal", code: "NP", dial: "+977", flag: "🇳🇵" },
  { name: "Netherlands", code: "NL", dial: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "NZ", dial: "+64", flag: "🇳🇿" },
  { name: "Nicaragua", code: "NI", dial: "+505", flag: "🇳🇮" },
  { name: "Nigeria", code: "NG", dial: "+234", flag: "🇳🇬" },
  { name: "Norway", code: "NO", dial: "+47", flag: "🇳🇴" },
  { name: "Oman", code: "OM", dial: "+968", flag: "🇴🇲" },
  { name: "Pakistan", code: "PK", dial: "+92", flag: "🇵🇰" },
  { name: "Panama", code: "PA", dial: "+507", flag: "🇵🇦" },
  { name: "Paraguay", code: "PY", dial: "+595", flag: "🇵🇾" },
  { name: "Peru", code: "PE", dial: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "PH", dial: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "PL", dial: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", dial: "+351", flag: "🇵🇹" },
  { name: "Puerto Rico", code: "PR", dial: "+1787", flag: "🇵🇷" },
  { name: "Qatar", code: "QA", dial: "+974", flag: "🇶🇦" },
  { name: "Romania", code: "RO", dial: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "RU", dial: "+7", flag: "🇷🇺" },
  { name: "Saudi Arabia", code: "SA", dial: "+966", flag: "🇸🇦" },
  { name: "Senegal", code: "SN", dial: "+221", flag: "🇸🇳" },
  { name: "Serbia", code: "RS", dial: "+381", flag: "🇷🇸" },
  { name: "Singapore", code: "SG", dial: "+65", flag: "🇸🇬" },
  { name: "Slovakia", code: "SK", dial: "+421", flag: "🇸🇰" },
  { name: "Slovenia", code: "SI", dial: "+386", flag: "🇸🇮" },
  { name: "Somalia", code: "SO", dial: "+252", flag: "🇸🇴" },
  { name: "South Africa", code: "ZA", dial: "+27", flag: "🇿🇦" },
  { name: "South Korea", code: "KR", dial: "+82", flag: "🇰🇷" },
  { name: "Spain", code: "ES", dial: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "LK", dial: "+94", flag: "🇱🇰" },
  { name: "Sudan", code: "SD", dial: "+249", flag: "🇸🇩" },
  { name: "Sweden", code: "SE", dial: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "CH", dial: "+41", flag: "🇨🇭" },
  { name: "Syria", code: "SY", dial: "+963", flag: "🇸🇾" },
  { name: "Taiwan", code: "TW", dial: "+886", flag: "🇹🇼" },
  { name: "Tanzania", code: "TZ", dial: "+255", flag: "🇹🇿" },
  { name: "Thailand", code: "TH", dial: "+66", flag: "🇹🇭" },
  { name: "Trinidad and Tobago", code: "TT", dial: "+1868", flag: "🇹🇹" },
  { name: "Tunisia", code: "TN", dial: "+216", flag: "🇹🇳" },
  { name: "Turkey", code: "TR", dial: "+90", flag: "🇹🇷" },
  { name: "Uganda", code: "UG", dial: "+256", flag: "🇺🇬" },
  { name: "Ukraine", code: "UA", dial: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "AE", dial: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "GB", dial: "+44", flag: "🇬🇧" },
  { name: "United States", code: "US", dial: "+1", flag: "🇺🇸" },
  { name: "Uruguay", code: "UY", dial: "+598", flag: "🇺🇾" },
  { name: "Venezuela", code: "VE", dial: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "VN", dial: "+84", flag: "🇻🇳" },
  { name: "Yemen", code: "YE", dial: "+967", flag: "🇾🇪" },
  { name: "Zambia", code: "ZM", dial: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "ZW", dial: "+263", flag: "🇿🇼" },
];

interface DropdownPortalProps {
  anchorRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

function DropdownPortal({ anchorRef, children }: DropdownPortalProps) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const update = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const dropdownHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorRef]);

  return createPortal(
    <div style={style}>{children}</div>,
    document.body
  );
}

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  onBlur: () => void;
  error?: string;
  delay: number;
}

export function PhoneInput({ value, onChange, onBlur, error, delay }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === 'MX') || COUNTRIES[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [localNumber, setLocalNumber] = useState('');
  const anchorRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const detect = async () => {
      const tryFetch = async (url: string, codeKey: string) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        return data[codeKey] as string | undefined;
      };

      let countryCode: string | undefined;
      try {
        countryCode = await tryFetch('https://ipapi.co/json/', 'country_code');
      } catch {
        try {
          countryCode = await tryFetch('https://ip-api.com/json/?fields=countryCode', 'countryCode');
        } catch {
          try {
            countryCode = await tryFetch('https://ipwho.is/', 'country_code');
          } catch {
          }
        }
      }

      if (countryCode) {
        const country = COUNTRIES.find(c => c.code === countryCode);
        if (country) {
          setSelectedCountry(country);
          onChange(country.dial);
        }
      }
    };
    detect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const portalDropdown = document.getElementById('phone-dropdown-portal');
      if (
        anchorRef.current &&
        !anchorRef.current.contains(target) &&
        !(portalDropdown && portalDropdown.contains(target))
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch('');
    onChange(country.dial + localNumber);
  }, [localNumber, onChange]);

  const handleNumberChange = (num: string) => {
    const cleaned = num.replace(/[^\d\s\-()]/g, '');
    setLocalNumber(cleaned);
    onChange(selectedCountry.dial + cleaned);
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div ref={anchorRef}>
        <div className={`flex w-full bg-fintel-bg-light border rounded-xl overflow-hidden transition-all duration-200 ${
          error
            ? 'border-red-400'
            : isOpen
            ? 'border-fintel-cyan shadow-input-focus'
            : 'border-fintel-border-light'
        }`}>
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="flex items-center gap-1.5 pl-3 pr-2 py-3 border-r border-fintel-border-light shrink-0 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl leading-none">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-fintel-text-primary">{selectedCountry.dial}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-fintel-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <input
            type="tel"
            placeholder="Número de WhatsApp"
            value={localNumber}
            onChange={(e) => handleNumberChange(e.target.value)}
            onBlur={onBlur}
            className="flex-1 bg-transparent pl-3 pr-4 py-3 text-fintel-text-primary placeholder-fintel-text-secondary focus:outline-none text-sm"
          />
        </div>

        <AnimatePresence>
          {isOpen && (
            <DropdownPortal anchorRef={anchorRef}>
              <motion.div
                id="phone-dropdown-portal"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="bg-white border border-fintel-border-light rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="p-2 border-b border-fintel-border-light">
                  <div className="flex items-center gap-2 bg-fintel-bg-light rounded-lg px-3 py-2">
                    <Search className="w-4 h-4 text-fintel-text-secondary shrink-0" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Buscar..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-fintel-text-primary placeholder-fintel-text-secondary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="max-h-52 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="text-center text-fintel-text-secondary text-sm py-4">Sin resultados</p>
                  ) : (
                    filtered.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleCountrySelect(country);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-fintel-bg-light transition-colors text-left ${
                          selectedCountry.code === country.code ? 'bg-fintel-bg-light' : ''
                        }`}
                      >
                        <span className="text-lg leading-none w-6 text-center">{country.flag}</span>
                        <span className="flex-1 text-sm text-fintel-text-primary truncate">
                          {country.name} ({country.code})
                        </span>
                        <span className="text-sm text-fintel-text-secondary font-medium shrink-0">{country.dial}</span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </DropdownPortal>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-1 pl-4"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
