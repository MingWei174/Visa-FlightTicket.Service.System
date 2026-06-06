import React, { useState, useEffect } from 'react';
import { Plane, Search, Sparkles, Globe, ShieldCheck, Coffee, ChevronRight } from 'lucide-react';

interface FlightPriceTrackerProps {
  globalCountry?: string;
  onTriggerToast: (msg: string) => void;
}

// Pre-compute flight data outside of template literals to avoid escaping issues
function generateRandomTime(): string {
  const h = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return h + ':' + m;
}

function generateDuration(): string {
  const hours = 5 + Math.floor(Math.random() * 12);
  const mins = Math.floor(Math.random() * 60);
  return hours + 'h ' + mins + 'm';
}

function generateBaggage(): string {
  const kg = 20 + Math.floor(Math.random() * 2) * 10;
  return kg + ' KG';
}

function generateSeatPitch(): string {
  const inches = 30 + Math.floor(Math.random() * 4);
  return inches + ' 吋寬敞座位';
}

export default function FlightPriceTracker({ globalCountry = 'Australia 澳洲', onTriggerToast }: FlightPriceTrackerProps) {
  const rawCountry = globalCountry.split(' ')[0] || 'Australia';
  const code = rawCountry.substring(0, 3).toUpperCase();
  
  const [isSearching, setIsSearching] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);

  // Comprehensive route database with realistic airlines, prices by distance
  const routeDB: Record<string, { code: string; airport: string; airports: {code: string; name: string}[]; distKm: number; airlines: {name: string; flightNo: string; dep: string; arr: string; stops: number; transit: string; baggage: string; wifi: boolean}[] }> = {
    '日本': { code: 'NRT', airport: '東京成田國際機場', distKm: 2100, airports: [{code:'NRT',name:'東京成田國際機場'},{code:'KIX',name:'大阪關西國際機場'},{code:'FUK',name:'福岡機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI100',dep:'08:50',arr:'13:15',stops:0,transit:'台北直飛 ➔ 東京成田',baggage:'2x23kg (學生特惠)',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR198',dep:'10:10',arr:'14:25',stops:0,transit:'台北直飛 ➔ 東京成田',baggage:'23kg',wifi:true},
      {name:'星宇航空 (STARLUX)',flightNo:'JX800',dep:'08:30',arr:'12:45',stops:0,transit:'台北直飛 ➔ 東京成田',baggage:'23kg (星級服務)',wifi:true},
      {name:'台灣虎航 (Tigerair)',flightNo:'IT200',dep:'06:15',arr:'10:30',stops:0,transit:'台北直飛 ➔ 東京成田',baggage:'20kg (需加購)',wifi:false},
      {name:'樂桃航空 (Peach)',flightNo:'MM856',dep:'14:55',arr:'19:10',stops:0,transit:'台北直飛 ➔ 東京成田',baggage:'20kg (需加購)',wifi:false},
    ]},
    '美國': { code: 'LAX', airport: '洛杉磯國際機場', distKm: 11000, airports: [{code:'LAX',name:'洛杉磯國際機場'},{code:'SFO',name:'舊金山國際機場'},{code:'JFK',name:'紐約甘迺迪機場'},{code:'SEA',name:'西雅圖機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI008',dep:'23:50',arr:'20:50',stops:0,transit:'台北直飛 ➔ 洛杉磯',baggage:'2x23kg (學生特惠)',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR012',dep:'19:20',arr:'16:15',stops:0,transit:'台北直飛 ➔ 洛杉磯',baggage:'2x23kg',wifi:true},
      {name:'聯合航空 (United Airlines)',flightNo:'UA872',dep:'11:35',arr:'08:40',stops:0,transit:'台北直飛 ➔ 舊金山',baggage:'23kg',wifi:true},
      {name:'國泰航空 (Cathay Pacific)',flightNo:'CX400',dep:'08:15',arr:'18:05',stops:1,transit:'於 香港 (HKG) 轉機 2h 15m',baggage:'2x23kg',wifi:true},
      {name:'達美航空 (Delta Air Lines)',flightNo:'DL275',dep:'16:20',arr:'22:35',stops:1,transit:'於 東京 (NRT) 轉機 3h',baggage:'23kg',wifi:true},
    ]},
    '加拿大': { code: 'YVR', airport: '溫哥華國際機場', distKm: 9800, airports: [{code:'YVR',name:'溫哥華國際機場'},{code:'YYZ',name:'多倫多皮爾遜機場'},{code:'YUL',name:'蒙特婁機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI032',dep:'23:35',arr:'19:35',stops:0,transit:'台北直飛 ➔ 溫哥華',baggage:'2x23kg (學生特惠)',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR010',dep:'23:55',arr:'19:50',stops:0,transit:'台北直飛 ➔ 溫哥華',baggage:'2x23kg',wifi:true},
      {name:'加拿大航空 (Air Canada)',flightNo:'AC012',dep:'01:30',arr:'21:00',stops:0,transit:'台北直飛 ➔ 溫哥華',baggage:'2x23kg',wifi:true},
      {name:'國泰航空 (Cathay Pacific)',flightNo:'CX838',dep:'09:00',arr:'18:30',stops:1,transit:'於 香港 (HKG) 轉機 2h',baggage:'2x23kg',wifi:true},
      {name:'大韓航空 (Korean Air)',flightNo:'KE692',dep:'18:30',arr:'15:20',stops:1,transit:'於 首爾 (ICN) 轉機 3h 40m',baggage:'23kg',wifi:false},
    ]},
    '澳洲': { code: 'SYD', airport: '雪梨金斯福德機場', distKm: 7400, airports: [{code:'SYD',name:'雪梨金斯福德機場'},{code:'MEL',name:'墨爾本機場'},{code:'BNE',name:'布里斯本機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI051',dep:'23:50',arr:'11:15',stops:0,transit:'台北直飛 ➔ 雪梨',baggage:'2x23kg (學生特惠)',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR232',dep:'22:15',arr:'09:50',stops:0,transit:'台北直飛 ➔ 雪梨',baggage:'23kg',wifi:true},
      {name:'澳洲航空 (Qantas)',flightNo:'QF026',dep:'09:55',arr:'21:10',stops:0,transit:'台北直飛 ➔ 雪梨',baggage:'2x23kg',wifi:true},
      {name:'新加坡航空 (Singapore Airlines)',flightNo:'SQ877',dep:'11:25',arr:'22:50',stops:1,transit:'於 新加坡 (SIN) 轉機 2h',baggage:'2x23kg (學生特惠)',wifi:true},
      {name:'馬來西亞航空 (Malaysia Airlines)',flightNo:'MH367',dep:'15:10',arr:'06:40',stops:1,transit:'於 吉隆坡 (KUL) 轉機 1h 30m',baggage:'30kg',wifi:false},
    ]},
    '英國': { code: 'LHR', airport: '倫敦希斯洛機場', distKm: 9800, airports: [{code:'LHR',name:'倫敦希斯洛機場'},{code:'MAN',name:'曼徹斯特機場'},{code:'EDI',name:'愛丁堡機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI069',dep:'21:50',arr:'06:30',stops:0,transit:'台北直飛 ➔ 倫敦',baggage:'2x23kg',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR068',dep:'22:10',arr:'06:55',stops:0,transit:'台北直飛 ➔ 倫敦',baggage:'2x23kg',wifi:true},
      {name:'國泰航空 (Cathay Pacific)',flightNo:'CX251',dep:'08:15',arr:'19:30',stops:1,transit:'於 香港 (HKG) 轉機 2h',baggage:'2x23kg',wifi:true},
      {name:'阿聯酋航空 (Emirates)',flightNo:'EK367',dep:'22:30',arr:'11:15',stops:1,transit:'於 杜拜 (DXB) 轉機 3h',baggage:'30kg',wifi:true},
      {name:'土耳其航空 (Turkish Airlines)',flightNo:'TK25',dep:'21:45',arr:'10:30',stops:1,transit:'於 伊斯坦堡 (IST) 轉機 2h 30m',baggage:'30kg',wifi:true},
    ]},
    '德國': { code: 'FRA', airport: '法蘭克福機場', distKm: 9200, airports: [{code:'FRA',name:'法蘭克福機場'},{code:'MUC',name:'慕尼黑機場'},{code:'TXL',name:'柏林機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI061',dep:'23:15',arr:'07:10',stops:0,transit:'台北直飛 ➔ 法蘭克福',baggage:'2x23kg',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR072',dep:'23:40',arr:'07:25',stops:0,transit:'台北直飛 ➔ 慕尼黑',baggage:'2x23kg',wifi:true},
      {name:'漢莎航空 (Lufthansa)',flightNo:'LH727',dep:'10:50',arr:'20:30',stops:1,transit:'於 曼谷 (BKK) 轉機',baggage:'23kg',wifi:true},
      {name:'土耳其航空 (Turkish Airlines)',flightNo:'TK25',dep:'21:45',arr:'09:20',stops:1,transit:'於 伊斯坦堡 (IST) 轉機 2h',baggage:'30kg',wifi:true},
      {name:'阿聯酋航空 (Emirates)',flightNo:'EK366',dep:'22:30',arr:'10:45',stops:1,transit:'於 杜拜 (DXB) 轉機 3h 30m',baggage:'30kg',wifi:true},
    ]},
    '法國': { code: 'CDG', airport: '巴黎戴高樂機場', distKm: 9700, airports: [{code:'CDG',name:'巴黎戴高樂機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI9243',dep:'23:30',arr:'08:10',stops:1,transit:'於 阿姆斯特丹 (AMS) 轉機',baggage:'2x23kg',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR088',dep:'23:40',arr:'07:50',stops:0,transit:'台北直飛 ➔ 巴黎',baggage:'2x23kg',wifi:true},
      {name:'法國航空 (Air France)',flightNo:'AF662',dep:'23:10',arr:'07:35',stops:0,transit:'台北直飛 ➔ 巴黎',baggage:'2x23kg',wifi:true},
      {name:'阿聯酋航空 (Emirates)',flightNo:'EK367',dep:'22:30',arr:'11:00',stops:1,transit:'於 杜拜 (DXB) 轉機 3h',baggage:'30kg',wifi:true},
      {name:'土耳其航空 (Turkish Airlines)',flightNo:'TK25',dep:'21:45',arr:'10:15',stops:1,transit:'於 伊斯坦堡 (IST) 轉機 2h 15m',baggage:'30kg',wifi:true},
    ]},
    '韓國': { code: 'ICN', airport: '仁川國際機場', distKm: 1500, airports: [{code:'ICN',name:'仁川國際機場'},{code:'PUS',name:'釜山金海機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI160',dep:'09:00',arr:'12:25',stops:0,transit:'台北直飛 ➔ 仁川',baggage:'2x23kg',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR160',dep:'08:20',arr:'11:50',stops:0,transit:'台北直飛 ➔ 仁川',baggage:'23kg',wifi:true},
      {name:'大韓航空 (Korean Air)',flightNo:'KE692',dep:'18:30',arr:'22:00',stops:0,transit:'台北直飛 ➔ 仁川',baggage:'23kg',wifi:true},
      {name:'韓亞航空 (Asiana Airlines)',flightNo:'OZ712',dep:'13:20',arr:'16:55',stops:0,transit:'台北直飛 ➔ 仁川',baggage:'23kg',wifi:false},
      {name:'台灣虎航 (Tigerair)',flightNo:'IT610',dep:'06:45',arr:'10:20',stops:0,transit:'台北直飛 ➔ 仁川',baggage:'20kg (需加購)',wifi:false},
    ]},
  };

  // Price calculation based on distance (simulated realistic pricing)
  const calcPrice = (distKm: number, isDirectFlight: boolean, isLCC: boolean): number => {
    const basePricePerKm = 2.8; // NTD per km base
    let price = distKm * basePricePerKm;
    if (isDirectFlight) price *= 1.1;
    if (isLCC) price *= 0.65;
    // Add some variation
    price *= (0.9 + Math.random() * 0.2);
    return Math.round(price / 100) * 100; // round to nearest 100
  };

  const lccAirlines = ['台灣虎航', '樂桃航空', '酷航', 'Tigerair', 'Peach', 'Scoot'];

  useEffect(() => {
    setIsSearching(true);
    
    // Find matching route
    let matchedRoute: any = null;
    for (const [key, route] of Object.entries(routeDB)) {
      if (globalCountry.includes(key)) {
        matchedRoute = route;
        break;
      }
    }

    if (!matchedRoute) {
      // Generic fallback for unknown destinations
      const genericDist = 8000;
      const genericFlights = [
        {id:'FL-GEN-0', airline:'中華航空 (China Airlines)',price:calcPrice(genericDist,false,false),departureTime:'23:30',arrivalTime:'08:00',duration:'轉機',stops:'1次轉機',baggage:'2x23kg',meal:'標準飛機餐',seatPitch:'舒適座位',wifi:'全程免費 Wi-Fi',arrivalCode:'???',destinationName:rawCountry},
        {id:'FL-GEN-1', airline:'長榮航空 (EVA Air)',price:calcPrice(genericDist,false,false),departureTime:'22:00',arrivalTime:'07:30',duration:'轉機',stops:'1次轉機',baggage:'23kg',meal:'標準飛機餐',seatPitch:'舒適座位',wifi:'全程免費 Wi-Fi',arrivalCode:'???',destinationName:rawCountry},
        {id:'FL-GEN-2', airline:'國泰航空 (Cathay Pacific)',price:calcPrice(genericDist,false,false),departureTime:'08:15',arrivalTime:'19:30',duration:'轉機',stops:'1次轉機',baggage:'2x23kg',meal:'標準飛機餐',seatPitch:'舒適座位',wifi:'全程免費 Wi-Fi',arrivalCode:'???',destinationName:rawCountry},
      ];
      setTimeout(() => { setFlights(genericFlights); setIsSearching(false); }, 800);
      return;
    }

    // Pick a random airport from available ones for variety
    const airportIdx = Math.floor(Math.random() * matchedRoute.airports.length);
    const selectedAirport = matchedRoute.airports[airportIdx];

    const builtFlights = matchedRoute.airlines.map((a: any, i: number) => {
      const isLCC = lccAirlines.some((lcc: string) => a.name.includes(lcc));
      const price = calcPrice(matchedRoute.distKm, a.stops === 0, isLCC);
      return {
        id: 'FL-' + selectedAirport.code + '-' + i,
        airline: a.name,
        price: price,
        departureTime: a.dep,
        arrivalTime: a.arr,
        duration: a.stops === 0 ? '直飛' : '轉機',
        stops: a.stops === 0 ? '直飛' : a.stops + '次轉機',
        baggage: a.baggage,
        meal: isLCC ? '需自費購買' : '標準飛機餐',
        seatPitch: isLCC ? '標準座位' : '舒適座位',
        wifi: a.wifi ? '全程免費 Wi-Fi' : '無 Wi-Fi',
        arrivalCode: selectedAirport.code,
        destinationName: selectedAirport.name,
        transitText: a.transit,
      };
    });

    setTimeout(() => { setFlights(builtFlights); setIsSearching(false); }, 600);
  }, [globalCountry, code]);

  const handleTrack = (flight: any) => {
    onTriggerToast('已將 ' + flight.airline + ' 的 ' + rawCountry + ' 航班加入追蹤清單！');
  };

  return (
    <div className="bg-[#FAF9F6] min-h-full p-6 md:p-10 font-serif text-[#4A4A4A]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#EFECE6] pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-wider text-[#5C6551]">Atlas. 航空資訊網</h1>
            <p className="text-[#A39D93] tracking-widest text-sm uppercase">即時為您分析飛往 {rawCountry} 的最佳航班與座位配置</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-[#EFECE6] shadow-sm flex items-center gap-3">
            <Globe className="h-4 w-4 text-[#8F9779]" />
            <span className="font-bold tracking-wide">目的地: {rawCountry}</span>
          </div>
        </div>

        {isSearching ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Plane className="h-10 w-10 text-[#8F9779] animate-bounce" />
              <div className="absolute inset-0 bg-[#8F9779] blur-xl opacity-20 animate-pulse"></div>
            </div>
            <p className="text-[#A39D93] tracking-widest animate-pulse">正在透過全球航空 GDS 系統檢索 {rawCountry} 的最新票價與座位資訊...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {flights.map((flight) => (
              <div key={flight.id} className="bg-white rounded-3xl p-6 border border-[#EFECE6] hover:shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:border-[#D6D2C4] transition-all flex flex-col md:flex-row gap-6">
                
                {/* Left: Flight Times & Airline */}
                <div className="flex-1 border-b md:border-b-0 md:border-r border-[#EFECE6] pb-6 md:pb-0 md:pr-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-lg text-[#5C6551]">{flight.airline}</span>
                    <span className="bg-[#F9F8F6] px-3 py-1 rounded-full text-xs font-bold text-[#A39D93] tracking-wider">{flight.stops}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-3xl font-black text-[#4A4A4A] mb-1">{flight.departureTime}</div>
                      <div className="text-xs text-[#A39D93] uppercase tracking-widest">TPE (台北)</div>
                    </div>
                    
                    <div className="flex-1 px-4 flex flex-col items-center">
                      <div className="text-[10px] text-[#A39D93] mb-1">{flight.duration}</div>
                      <div className="w-full relative flex items-center justify-center">
                        <div className="w-full h-[1px] bg-[#D6D2C4]"></div>
                        <Plane className="h-4 w-4 text-[#8F9779] absolute" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-black text-[#4A4A4A] mb-1">{flight.arrivalTime}</div>
                      <div className="text-xs text-[#A39D93] uppercase tracking-widest">{flight.arrivalCode} ({flight.destinationName})</div>
                    </div>
                  </div>
                </div>

                {/* Middle: Amenities (Seats, Meals) */}
                <div className="flex-1 flex flex-col justify-center space-y-3 px-2">
                  <div className="flex items-center gap-3 text-sm text-[#6A6A6A]">
                    <ShieldCheck className="h-4 w-4 text-[#8F9779]" />
                    <span>行李額度: <strong className="text-[#4A4A4A]">{flight.baggage}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#6A6A6A]">
                    <Coffee className="h-4 w-4 text-[#8F9779]" />
                    <span>機上餐飲: <strong className="text-[#4A4A4A]">{flight.meal}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#6A6A6A]">
                    <Search className="h-4 w-4 text-[#8F9779]" />
                    <span>座位配置: <strong className="text-[#4A4A4A]">{flight.seatPitch}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#6A6A6A]">
                    <Sparkles className="h-4 w-4 text-[#8F9779]" />
                    <span>{flight.wifi}</span>
                  </div>
                </div>

                {/* Right: Price & Action */}
                <div className="w-full md:w-48 flex flex-col justify-center items-end border-t md:border-t-0 border-[#EFECE6] pt-6 md:pt-0">
                  <div className="text-xs tracking-widest text-[#A39D93] mb-1">學生專屬含稅價</div>
                  <div className="text-3xl font-black text-[#5C6551] mb-4">NT$ {flight.price.toLocaleString()}</div>
                  <button 
                    onClick={() => handleTrack(flight)}
                    className="w-full py-3 bg-[#8F9779] hover:bg-[#7A8270] text-white rounded-xl font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <span>設定票價提醒</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
