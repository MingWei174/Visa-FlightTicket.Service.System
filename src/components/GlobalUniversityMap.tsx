import React, { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { Search, Globe2, GraduationCap } from 'lucide-react';
import partnersData from '../data/partners.json';
import { countryCoordinates } from '../data/countryCoordinates';
import CountryDetailView from './CountryDetailView';
import { UniversityService } from '../services/UniversityService';

interface GlobalUniversityMapProps {
  globalCountry?: string;
  setGlobalCountry?: (c: string) => void;
  onSetTarget?: (country: string, uni: string) => void;
}

export default function GlobalUniversityMap({ globalCountry, setGlobalCountry, onSetTarget }: GlobalUniversityMapProps) {
  const globeEl = useRef<any>();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoverD, setHoverD] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // When a country is selected (from map or search)
  const handleCountrySelect = async (countryQuery: string, knownCoords?: {lat: number, lng: number}) => {
    setIsAnimating(true);
    
    // Try to fuzzy match the country name first from our predefined list
    const matchedCountryName = Object.keys(countryCoordinates).find(
      c => c.toLowerCase().includes(countryQuery.toLowerCase())
    ) || countryQuery;

    let coords = knownCoords;
    
    if (!coords) {
       // Try predefined
       coords = countryCoordinates[matchedCountryName];
       // Or fetch from API
       if (!coords) {
         const info = await UniversityService.getCountryInfo(matchedCountryName);
         if (info) coords = { lat: info.lat, lng: info.lng };
       }
    }

    // 1. Zoom into country VERY deeply (altitude 0.2)
    if (globeEl.current && coords) {
      globeEl.current.controls().autoRotate = false;
      globeEl.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 0.2 }, 1500);
    }
    
    // 2. Set global state if provided
    if (setGlobalCountry) {
      setGlobalCountry(matchedCountryName);
    }

    // 3. Wait for animation, then show overlay
    setTimeout(() => {
      setSelectedCountry(matchedCountryName);
      setIsAnimating(false);
    }, 1500);
  };

  const mapData = useMemo(() => {
    return Object.entries(countryCoordinates).map(([country, coords]) => ({
      country,
      lat: coords.lat,
      lng: coords.lng,
      size: 0.2, // flat circles
      color: '#8F9779'
    }));
  }, []);

  useEffect(() => {
    // Auto-rotate the globe slowly
    if (globeEl.current && !selectedCountry && !isAnimating) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, [selectedCountry, isAnimating]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleCountrySelect(searchTerm.trim());
      setShowSuggestions(false);
    }
  };

  const searchContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-100px)] rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-xl flex">
      
      {/* Search Bar Overlay */}
      <div className="absolute top-8 left-8 z-10 w-80">
        <div className="bg-white/80 backdrop-blur-lg border border-gray-200 p-6 rounded-none shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <Globe2 className="h-6 w-6 text-[#8F9779]" />
            <h2 className="text-gray-800 font-serif font-black text-lg tracking-wide">全球探索</h2>
          </div>
          
          <div className="relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative z-20">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="輸入國家或姐妹校名稱..."
                className="w-full bg-white border border-gray-200 rounded-none py-3 pl-10 pr-4 text-sm text-gray-700 focus:outline-none focus:border-[#8F9779] shadow-sm font-serif"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
              />
            </form>
            
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl z-30 max-h-60 overflow-y-auto">
                {searchTerm.length === 0 ? (
                  <>
                    <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest">熱門留學國家</div>
                    {['日本', '美國', '澳洲', '加拿大', '英國', '德國'].map(c => (
                      <button
                        key={c}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F3F0E9] font-serif border-b border-gray-50"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchTerm(c);
                          setShowSuggestions(false);
                          handleCountrySelect(c);
                        }}
                      >
                        📍 {c}
                      </button>
                    ))}
                    <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-t border-gray-200">全球姊妹校國家分佈</div>
                    {Object.entries(
                      partnersData.reduce((acc, p) => {
                        const c = p.country?.split(' ')[0] || '其他';
                        acc[c] = (acc[c] || 0) + 1;
                        return acc;
                      }, {})
                    )
                      .sort((a, b) => b[1] - a[1])
                      .map(([country, count]) => (
                      <button
                        key={'ncu-country-' + country}
                        className="w-full text-left px-4 py-2 text-sm text-[#5C6551] hover:bg-[#F3F0E9] font-serif border-b border-gray-50 flex flex-col"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchTerm('');
                          setShowSuggestions(false);
                          handleCountrySelect(country);
                        }}
                      >
                        <span className="font-bold truncate">📍 {country} <span className="text-xs text-gray-400 font-normal">({count} 所姊妹校)</span></span>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {partnersData.filter((p: any) => 
                      p.nameCn?.includes(searchTerm) || 
                      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).slice(0, 10).map((p: any, idx) => (
                      <button
                        key={'partner-'+idx}
                        className="w-full text-left px-4 py-2 text-sm text-[#5C6551] hover:bg-[#F3F0E9] font-serif border-b border-gray-50 flex flex-col"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchTerm(p.nameCn);
                          setShowSuggestions(false);
                          handleCountrySelect(p.country);
                        }}
                      >
                        <span className="font-bold truncate">{p.nameCn}</span>
                        <span className="text-[10px] text-gray-500 truncate">{p.country}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="mt-6">
            <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-[#8F9779]" /> 中央大學全球姊妹校
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(partnersData.reduce((acc: any, p: any) => {
                const c = p.country || '其他';
                if (!acc[c]) acc[c] = 0;
                acc[c]++;
                return acc;
              }, {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 15).map(([c, count]: any) => (
                <button
                  key={c}
                  onClick={() => handleCountrySelect(c)}
                  className="px-3 py-1.5 bg-white border border-[#EFECE6] rounded-xl text-xs font-bold text-[#5C6551] hover:bg-[#F3F0E9] hover:border-[#D6D2C4] hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  {c.split(' ')[0]} <span className="text-[#A39D93] ml-0.5">({count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3D Globe */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing bg-[#FDFBF7]">
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundColor="#FDFBF7"
          pointsData={mapData}
          pointLat="lat"
          pointLng="lng"
          pointColor={(d: any) => d === hoverD ? '#E1C699' : d.color}
          pointAltitude={0.01}
          pointRadius={(d: any) => d === hoverD ? 1.0 : 0.6}
          pointsMerge={false}
          onPointHover={setHoverD}
          onPointClick={(d: any) => handleCountrySelect(d.country, d)}
          pointLabel={(d: any) => '<div class="bg-slate-900 p-2 rounded-lg border border-white/10 shadow-lg text-xs font-sans"><strong class="text-white block">' + d.country + '</strong></div>'}

        />
      </div>

      {/* Country Detail View Overlay */}
      {selectedCountry && (
        <CountryDetailView 
          countryName={selectedCountry} 
          onClose={() => {
            setSelectedCountry(null);
            if (globeEl.current) {
               globeEl.current.pointOfView({ altitude: 1.8 }, 1500);
            }
          }} 
          onSetTarget={onSetTarget}
        />
      )}
    </div>
  );
}
