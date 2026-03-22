'use client';

import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiMapPin, FiNavigation } from 'react-icons/fi';

interface AddressItem {
  display_name: string;
  lat: string;
  lon: string;
}

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface PlaceResult {
  name: string;
  phone: string;
  addr: string;
}

interface LeafletMap {
  setView(center: [number, number], zoom: number): void;
  remove(): void;
  fitBounds(bounds: [[number, number], [number, number]]): void;
}

interface LeafletMarker {
  remove: () => void;
}

const EMERGENCY_NUMBERS = [
  { name: '응급 신고', number: '119', desc: '화재·구조·응급환자', color: 'bg-red-500', emoji: '🚨' },
  { name: '경찰 신고', number: '112', desc: '범죄·사고 신고', color: 'bg-blue-500', emoji: '🚔' },
  { name: '자살예방 상담', number: '1393', desc: '24시간 위기상담', color: 'bg-purple-500', emoji: '💙' },
  { name: '산모신생아 건강관리', number: '1588-7100', desc: '정부 산모 지원 서비스', color: 'bg-pink-500', emoji: '👶' },
  { name: '소아과 응급 상담', number: '1577-0199', desc: '소아 응급의료 정보', color: 'bg-green-500', emoji: '🏥' },
  { name: '중독 상담', number: '1588-9780', desc: '약물·화학물질 중독', color: 'bg-orange-500', emoji: '⚠️' },
];

const SEARCH_CATEGORIES = [
  { label: '🏥 소아과', query: 'amenity=clinic', name: '소아과' },
  { label: '🤰 산부인과', query: 'amenity=hospital', name: '산부인과' },
  { label: '💊 약국', query: 'amenity=pharmacy', name: '약국' },
];

export default function EmergencyPage() {
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const myMarkerRef = useRef<LeafletMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [userPos, setUserPos] = useState<[number, number]>([37.5665, 126.9780]);
  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressItem[]>([]);
  const [locationLabel, setLocationLabel] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => initMap();
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const initMap = () => {
    const L = (window as any).L;
    if (!L || mapRef.current) return;

    const map = L.map('osm-map', { zoomControl: true }).setView([37.5665, 126.9780], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);
  };

  // 현재 위치 자동 감지
  const detectMyLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 감지를 지원하지 않습니다.\n주소를 직접 입력해주세요.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        moveToPosition(lat, lng, '현재 위치');
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          alert('위치 권한이 거부되었습니다.\n브라우저 주소창 왼쪽 자물쇠 아이콘 → 위치 허용 후 다시 시도하거나,\n아래 주소 검색창에 동네 이름을 입력해주세요.');
        } else {
          alert('위치를 가져올 수 없습니다. 주소를 직접 입력해주세요.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // 지도 이동 + 내 위치 마커 업데이트
  const moveToPosition = (lat: number, lng: number, label: string) => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;

    setUserPos([lat, lng]);
    setLocationLabel(label);
    mapRef.current.setView([lat, lng], 15);

    if (myMarkerRef.current) myMarkerRef.current.remove();
    const myIcon = L.divIcon({
      className: '',
      html: `<div style="width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    myMarkerRef.current = L.marker([lat, lng], { icon: myIcon })
      .addTo(mapRef.current)
      .bindPopup(`📍 ${label}`)
      .openPopup();
  };

  // 주소 자동완성 (Nominatim)
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddressInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setAddressSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + ' 한국')}&format=json&limit=5&accept-language=ko`,
          { headers: { 'Accept-Language': 'ko' } }
        );
        const data = await res.json();
        setAddressSuggestions(data);
      } catch {}
    }, 400);
  };

  const selectAddress = (item: AddressItem) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const label = item.display_name.split(',')[0];
    setAddressInput(label);
    setAddressSuggestions([]);
    moveToPosition(lat, lng, label);
    setPlaces([]);
    setActiveCategory('');
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
  };

  // 주변 장소 검색 (Overpass API)
  const searchNearby = async (categoryQuery: string, categoryName: string) => {
    if (!mapRef.current || searching) return;
    setSearching(true);
    setActiveCategory(categoryName);
    setPlaces([]);
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const [lat, lng] = userPos;
    try {
      const query = `
        [out:json][timeout:15];
        (
          node["${categoryQuery}"](around:3000,${lat},${lng});
          way["${categoryQuery}"](around:3000,${lat},${lng});
        );
        out center 10;
      `;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      const data = await res.json();
      const L = (window as any).L;
      const results: PlaceResult[] = [];

      data.elements?.slice(0, 8).forEach((el: OverpassElement) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;
        if (!elLat || !elLng) return;

        const name = el.tags?.name || el.tags?.['name:ko'] || categoryName;
        const phone = el.tags?.phone || el.tags?.['contact:phone'] || '';
        const addr = el.tags?.['addr:full'] || el.tags?.['addr:street'] || '';

        const icon = L.divIcon({
          className: '',
          html: `<div style="background:#ec4899;color:white;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25)">${categoryName === '약국' ? '💊' : '🏥'} ${name.length > 8 ? name.slice(0, 8) + '…' : name}</div>`,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        const marker = L.marker([elLat, elLng], { icon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="min-width:150px;font-family:sans-serif">
              <b style="font-size:13px">${name}</b><br/>
              ${phone ? `<a href="tel:${phone}" style="color:#ec4899">📞 ${phone}</a><br/>` : ''}
              ${addr ? `<span style="font-size:11px;color:#888">📍 ${addr}</span>` : ''}
            </div>
          `);

        markersRef.current.push(marker);
        results.push({ name, phone, addr });
      });

      setPlaces(results);
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        mapRef.current.fitBounds(group.getBounds().pad(0.3));
      } else {
        alert(`반경 3km 내 ${categoryName}을(를) 찾지 못했습니다.`);
      }
    } catch {
      alert('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    setSearching(false);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">응급 연락처 🚨</h1>
      <p className="text-sm text-gray-500 mb-6">긴급 상황 시 아래 버튼을 눌러 바로 전화하세요</p>

      {/* 응급 전화번호 */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {EMERGENCY_NUMBERS.map(item => (
          <a key={item.number} href={`tel:${item.number}`}
            className={`${item.color} text-white rounded-2xl p-4 flex flex-col items-center text-center shadow-md active:scale-95 transition-transform`}>
            <span className="text-2xl mb-1">{item.emoji}</span>
            <p className="font-bold text-lg leading-none mb-0.5">{item.number}</p>
            <p className="font-bold text-sm">{item.name}</p>
            <p className="text-xs opacity-80 mt-1">{item.desc}</p>
          </a>
        ))}
      </div>

      {/* 지도 섹션 */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-50 space-y-3">
          <h2 className="font-bold text-gray-700 text-sm">주변 병원·약국 찾기</h2>

          {/* 위치 설정 */}
          <div className="flex gap-2">
            {/* 현재 위치 버튼 */}
            <button
              onClick={detectMyLocation}
              disabled={locating || !mapReady}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors shrink-0"
            >
              <FiNavigation size={13} />
              {locating ? '감지 중…' : '현재 위치'}
            </button>

            {/* 주소 직접 검색 */}
            <div className="relative flex-1">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 gap-2">
                <FiSearch size={13} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="동네 이름 입력 (예: 강남구)"
                  value={addressInput}
                  onChange={handleAddressChange}
                  className="w-full py-2 text-xs bg-transparent outline-none text-gray-700"
                />
              </div>
              {/* 자동완성 드롭다운 */}
              {addressSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 shadow-xl rounded-xl mt-1 z-50 overflow-hidden">
                  {addressSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => selectAddress(s)}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-pink-50 transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0"
                    >
                      <FiMapPin size={11} className="text-pink-400 shrink-0" />
                      <span className="truncate text-gray-700">{s.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 현재 기준 위치 표시 */}
          {locationLabel && (
            <p className="text-xs text-blue-500 flex items-center gap-1">
              <FiMapPin size={11} /> 기준 위치: <span className="font-bold">{locationLabel}</span>
            </p>
          )}

          {/* 카테고리 검색 버튼 */}
          <div className="flex gap-2">
            {SEARCH_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => searchNearby(cat.query, cat.name)}
                disabled={searching || !mapReady}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors border ${
                  activeCategory === cat.name
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100'
                } disabled:opacity-50`}
              >
                {searching && activeCategory === cat.name ? '검색 중…' : cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaflet 지도 */}
        <div id="osm-map" style={{ height: '360px', width: '100%' }} />

        {/* 검색 결과 리스트 */}
        {places.length > 0 && (
          <div className="p-4 border-t border-gray-50 max-h-56 overflow-y-auto space-y-2">
            <p className="text-xs font-bold text-gray-500 mb-2">
              📍 {locationLabel || '현재 위치'} 반경 3km · {places.length}건
            </p>
            {places.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-pink-50 rounded-xl">
                <span className="text-lg shrink-0">🏥</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-gray-800 truncate">{p.name}</p>
                  {p.phone
                    ? <a href={`tel:${p.phone}`} className="text-xs text-pink-500 font-medium">📞 {p.phone}</a>
                    : <p className="text-xs text-gray-300">전화번호 정보 없음</p>
                  }
                  {p.addr && <p className="text-xs text-gray-400 truncate mt-0.5">{p.addr}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {!mapReady && (
          <div className="h-8 flex items-center justify-center bg-gray-50 text-xs text-gray-400">
            지도 불러오는 중...
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-300 mt-4">
        지도: © OpenStreetMap · 장소 검색: Overpass API · 주소 변환: Nominatim
      </p>
    </div>
  );
}
