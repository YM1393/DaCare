'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { FiSend, FiMessageCircle, FiX, FiAlertTriangle, FiMapPin, FiPhone, FiHeart, FiCpu, FiMessageSquare, FiSearch } from 'react-icons/fi';
import type { StoredUser } from '@/types';

// 긴급 상황 키워드
const EMERGENCY_KEYWORDS = [
  '아파', '아프', '열나', '열이', '고열', '구토', '토해', '경련', '발작',
  '응급', '위급', '긴급', '숨이', '의식', '경기', '설사', '피가', '피나',
  '쓰러', '못 숨', '못숨', '안 숨', '안숨', '심한', '많이 아', '너무 아',
];
function detectEmergency(text: string): boolean {
  return EMERGENCY_KEYWORDS.some(kw => text.includes(kw));
}

interface HospitalResult {
  name: string; phone: string; addr: string; type: string; lat: number; lng: number;
}
interface FavoriteHospital {
  name: string; phone: string; addr: string; type: string;
}
interface ChatMessage {
  roomId: string; user: string; text: string; time: string;
  isAI?: boolean; isSystem?: boolean; isHospitalCard?: boolean;
  hospitals?: HospitalResult[]; hospitalType?: string;
  showChoices?: boolean; isEmergency?: boolean;
}

const HOSPITAL_CATEGORIES = [
  { label: '🏥 소아과', query: 'amenity=clinic', name: '소아과' },
  { label: '🤰 산부인과', query: 'amenity=hospital', name: '산부인과' },
  { label: '💊 약국', query: 'amenity=pharmacy', name: '약국' },
];

export default function Chat() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);

  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [searchingHospital, setSearchingHospital] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteHospital[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedFavs = localStorage.getItem('favoriteHospitals');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketRef.current && socketUrl) {
      socketRef.current = io(socketUrl);
      socketRef.current.emit('join_room', 'dacare_main');
      socketRef.current.on('receive_message', (data: ChatMessage) => {
        setChatLog(prev => [...prev, data]);
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('receive_message');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // 채팅창 열릴 때 AI 먼저 인사 + 선택지 제공
  useEffect(() => {
    if (isOpen && !openedRef.current) {
      openedRef.current = true;
      setTimeout(() => {
        const welcomeMsg: ChatMessage = {
          roomId: 'dacare_main',
          user: '다케어 AI',
          text: '안녕하세요! 다케어 상담 채팅입니다 🌸\n무엇을 도와드릴까요?',
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          isAI: true,
          showChoices: true,
        };
        setChatLog([welcomeMsg]);
      }, 400);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, showEmergencyPanel]);

  const saveFavoriteHospital = (hospital: HospitalResult) => {
    const fav: FavoriteHospital = { name: hospital.name, phone: hospital.phone, addr: hospital.addr, type: hospital.type };
    const updated = [fav, ...favorites.filter(f => f.name !== fav.name)].slice(0, 5);
    setFavorites(updated);
    localStorage.setItem('favoriteHospitals', JSON.stringify(updated));
  };
  const removeFavorite = (name: string) => {
    const updated = favorites.filter(f => f.name !== name);
    setFavorites(updated);
    localStorage.setItem('favoriteHospitals', JSON.stringify(updated));
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!user) { alert('로그인 후 채팅이 가능합니다.'); return; }

    const isEmergency = detectEmergency(message);
    const data: ChatMessage = {
      roomId: 'dacare_main',
      user: user.name,
      text: message,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    if (socketRef.current) socketRef.current.emit('send_message', data);
    else setChatLog(prev => [...prev, data]);

    const sentMessage = message;
    setMessage('');

    // 긴급 감지 → 긴급 패널 자동 오픈
    if (isEmergency) {
      setShowEmergencyPanel(true);
      const emergencyMsg: ChatMessage = {
        roomId: 'dacare_main',
        user: '다케어',
        text: '🚨 긴급 상황이 감지되었습니다. 아래 버튼을 눌러 즉시 도움을 받으세요!',
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        isEmergency: true,
      };
      setChatLog(prev => [...prev, emergencyMsg]);
      return;
    }

    // AI 자동 응답 + 선택지
    try {
      const res = await fetch('/api/chat/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sentMessage }),
      });
      const result = await res.json();
      if (result.aiReply) {
        const aiData: ChatMessage = {
          roomId: 'dacare_main',
          user: '다케어 AI',
          text: result.aiReply,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          isAI: true,
          showChoices: true,
        };
        if (socketRef.current) socketRef.current.emit('send_message', aiData);
        else setChatLog(prev => [...prev, aiData]);
      }
    } catch { /* AI 응답 실패 무시 */ }
  };

  const handleEmergencyNotify = async () => {
    if (!user) return;
    setNotifying(true);
    try {
      const res = await fetch('/api/emergency/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          message: `${user.name} 산모님이 긴급 도움을 요청했습니다.`,
        }),
      });
      const result = await res.json();
      const systemMsg: ChatMessage = {
        roomId: 'dacare_main',
        user: '시스템',
        text: result.sent > 0
          ? `🚨 ${result.helperName ? result.helperName + ' 도우미님' : `${result.sent}명의 도우미`}에게 긴급 알림을 발송했습니다. 잠시만 기다려 주세요.`
          : '현재 알림을 받을 수 있는 도우미가 없습니다. 119에 직접 연락하세요.',
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      };
      setChatLog(prev => [...prev, systemMsg]);
    } catch { alert('알림 발송 중 오류가 발생했습니다.'); }
    setNotifying(false);
    setShowEmergencyPanel(false);
  };

  const handleSearchHospital = async (categoryQuery: string, categoryName: string) => {
    setSearchingHospital(true);
    setShowEmergencyPanel(false);
    const loadingMsg: ChatMessage = {
      roomId: 'dacare_main', user: '다케어',
      text: `📍 현재 위치에서 가까운 ${categoryName}을(를) 찾고 있습니다...`,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatLog(prev => [...prev, loadingMsg]);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      const query = `[out:json][timeout:15];(node["${categoryQuery}"](around:3000,${lat},${lng});way["${categoryQuery}"](around:3000,${lat},${lng}););out center 8;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
      const data = await res.json();
      interface OverpassEl { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string>; }
      const hospitals: HospitalResult[] = (data.elements as OverpassEl[])?.slice(0, 6).map(el => ({
        name: el.tags?.name || el.tags?.['name:ko'] || categoryName,
        phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
        addr: el.tags?.['addr:full'] || el.tags?.['addr:street'] || '',
        type: categoryName,
        lat: el.lat ?? el.center?.lat ?? 0,
        lng: el.lon ?? el.center?.lon ?? 0,
      })).filter(h => h.lat !== 0) || [];

      const resultMsg: ChatMessage = hospitals.length === 0
        ? { roomId: 'dacare_main', user: '다케어', text: `반경 3km 내 ${categoryName}을(를) 찾지 못했습니다. 응급 시 119에 연락하세요.`, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), isSystem: true }
        : { roomId: 'dacare_main', user: '다케어', text: '', time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), isSystem: true, isHospitalCard: true, hospitals, hospitalType: categoryName };
      setChatLog(prev => [...prev.slice(0, -1), resultMsg]);
    } catch {
      const errMsg: ChatMessage = { roomId: 'dacare_main', user: '다케어', text: '위치 정보를 가져올 수 없습니다. 브라우저 위치 권한을 허용해 주세요.', time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), isSystem: true };
      setChatLog(prev => [...prev.slice(0, -1), errMsg]);
    }
    setSearchingHospital(false);
  };

  // 선택지 버튼 렌더
  const renderChoiceButtons = (isEmergencyMode = false) => (
    <div className={`mt-3 space-y-2 ${isEmergencyMode ? '' : ''}`}>
      {isEmergencyMode ? (
        <>
          <p className="text-sm font-bold text-red-600 mb-2 flex items-center gap-1.5">
            <FiAlertTriangle size={15} /> 긴급 상황 — 빠른 도움 받기
          </p>
          <button
            onClick={handleEmergencyNotify}
            disabled={notifying}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            🚨 {notifying ? '알림 발송 중...' : '담당 관리사에게 긴급 알림 보내기'}
          </button>
          <button
            onClick={() => { setShowEmergencyPanel(false); router.push('/messages'); }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <FiMessageSquare size={15} /> 관리사와 채팅 연결하기
          </button>
          <p className="text-sm font-bold text-gray-600 mt-3 mb-2">📍 근처 병의원 바로 찾기</p>
          {HOSPITAL_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => handleSearchHospital(cat.query, cat.name)}
              disabled={searchingHospital}
              className="w-full bg-white border-2 border-pink-200 text-pink-600 text-sm py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pink-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              {searchingHospital ? '검색 중...' : cat.label + ' 찾기'}
            </button>
          ))}
          <a href="tel:119"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-3 rounded-2xl font-bold flex items-center justify-center gap-1.5 mt-1 transition-colors shadow-sm">
            📞 119 응급 신고 (직통)
          </a>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-1.5">계속 진행하시겠어요?</p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => {
                const msg: ChatMessage = {
                  roomId: 'dacare_main', user: '시스템',
                  text: 'AI와 계속 대화합니다. 궁금한 점을 입력해주세요 🤖',
                  time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                  isSystem: true,
                };
                setChatLog(prev => [...prev, msg]);
              }}
              className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-sm py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FiCpu size={15} /> AI와 계속 상담하기
            </button>
            <button
              onClick={() => router.push('/messages')}
              className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FiMessageSquare size={15} /> 관리사와 채팅 연결하기
            </button>
            <button
              onClick={() => setShowEmergencyPanel(true)}
              className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FiSearch size={15} /> 근처 병의원 검색하기
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="fixed bottom-6 right-4 z-[9999]">
      {isOpen ? (
        <div
          className="bg-white shadow-2xl rounded-3xl flex flex-col border border-pink-100 animate-in fade-in zoom-in duration-200"
          style={{ width: '420px', height: '680px', maxWidth: 'calc(100vw - 24px)' }}
        >
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white flex justify-between items-center rounded-t-3xl shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm" />
              <div>
                <span className="font-bold text-base">다케어 상담 채팅</span>
                <p className="text-xs text-pink-100 mt-0.5">AI 상담 · 관리사 연결 · 병원 검색</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {favorites.length > 0 && (
                <button onClick={() => setShowFavorites(v => !v)}
                  className="hover:bg-white/20 p-2 rounded-xl transition-colors relative"
                  title="자주 가는 병원">
                  <FiHeart size={18} />
                  <span className="absolute -top-1 -right-1 text-[10px] bg-yellow-400 text-gray-800 rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {favorites.length}
                  </span>
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* 즐겨찾기 드롭다운 */}
          {showFavorites && favorites.length > 0 && (
            <div className="bg-yellow-50 border-b border-yellow-100 p-3 shrink-0 max-h-48 overflow-y-auto">
              <p className="text-sm font-bold text-yellow-700 mb-2 flex items-center gap-1.5">
                <FiHeart size={13} /> 자주 가는 병원
              </p>
              <div className="space-y-2">
                {favorites.map((fav, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 shadow-sm">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-800 truncate">{fav.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fav.type}{fav.phone && ` · ${fav.phone}`}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      {fav.phone && (
                        <a href={`tel:${fav.phone}`} className="bg-green-500 text-white rounded-lg p-1.5 hover:bg-green-600">
                          <FiPhone size={13} />
                        </a>
                      )}
                      <button onClick={() => removeFavorite(fav.name)} className="text-gray-300 hover:text-red-400">
                        <FiX size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 채팅 내용 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/40 min-h-0">
            {chatLog.map((chat, i) => {
              // 병원 카드
              if (chat.isHospitalCard && chat.hospitals) {
                return (
                  <div key={i} className="w-full">
                    <p className="text-sm text-gray-400 mb-2 px-1">
                      📍 현재 위치 반경 3km · {chat.hospitalType} {chat.hospitals.length}곳
                    </p>
                    <div className="space-y-2.5">
                      {chat.hospitals.map((h, hi) => (
                        <div key={hi} className="bg-white border border-pink-100 rounded-2xl p-3.5 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-base text-gray-800 truncate">{h.name}</p>
                              {h.addr && <p className="text-xs text-gray-400 truncate mt-0.5">{h.addr}</p>}
                            </div>
                            <button onClick={() => saveFavoriteHospital(h)}
                              className="shrink-0 text-gray-300 hover:text-pink-400 transition-colors mt-0.5" title="즐겨찾기">
                              <FiHeart size={16} />
                            </button>
                          </div>
                          <div className="flex gap-2 mt-2.5">
                            {h.phone ? (
                              <a href={`tel:${h.phone}`}
                                className="flex-1 bg-green-500 text-white text-sm py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-green-600">
                                <FiPhone size={13} /> {h.phone}
                              </a>
                            ) : (
                              <span className="flex-1 text-center text-sm text-gray-300 py-2">전화번호 없음</span>
                            )}
                            <a href={`https://map.kakao.com/link/search/${encodeURIComponent(h.name)}`}
                              target="_blank" rel="noreferrer"
                              className="bg-yellow-400 text-gray-800 text-sm py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-yellow-500">
                              <FiMapPin size={13} /> 지도
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 긴급 시스템 메시지
              if (chat.isEmergency) {
                return (
                  <div key={i} className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                    <p className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
                      <FiAlertTriangle size={16} /> {chat.text}
                    </p>
                    {renderChoiceButtons(true)}
                  </div>
                );
              }

              // 일반 시스템 메시지
              if (chat.isSystem) {
                return (
                  <div key={i} className="flex justify-center">
                    <span className="text-sm bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-center max-w-[90%]">
                      {chat.text}
                    </span>
                  </div>
                );
              }

              // AI 메시지 + 선택지
              if (chat.isAI) {
                return (
                  <div key={i} className="flex flex-col items-start gap-1">
                    <span className="text-xs text-gray-400 px-1">🤖 {chat.user} {chat.time}</span>
                    <div className="bg-purple-50 text-purple-900 border border-purple-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%] text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                      {chat.text}
                    </div>
                    {chat.showChoices && i === chatLog.filter(c => c.isAI).length + chatLog.filter(c => !c.isAI && !c.isSystem).length - 1
                      ? renderChoiceButtons(false)
                      : chat.showChoices && i === chatLog.length - 1
                      ? renderChoiceButtons(false)
                      : null}
                  </div>
                );
              }

              // 내 메시지 / 상대 메시지
              const isMe = chat.user === user?.name;
              return (
                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-400 mb-1 px-1">{chat.user} {chat.time}</span>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    isMe
                      ? 'bg-pink-500 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                  }`}>
                    {chat.text}
                  </div>
                </div>
              );
            })}

            {/* 긴급 패널 (배너 대신 인라인) */}
            {showEmergencyPanel && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-base font-bold text-red-600 flex items-center gap-2">
                    <FiAlertTriangle size={18} /> 긴급 상황 도움
                  </p>
                  <button onClick={() => setShowEmergencyPanel(false)} className="text-gray-400 hover:text-gray-600">
                    <FiX size={18} />
                  </button>
                </div>
                {renderChoiceButtons(true)}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* 하단 긴급 버튼 */}
          {!showEmergencyPanel && (
            <div className="px-4 pt-2 pb-1 shrink-0">
              <button
                onClick={() => setShowEmergencyPanel(true)}
                className="w-full text-sm text-red-500 border border-red-200 bg-red-50 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
              >
                <FiAlertTriangle size={14} /> 긴급 상황 / 병의원 검색
              </button>
            </div>
          )}

          {/* 입력창 */}
          <div className="p-4 bg-white border-t border-gray-100 flex gap-3 rounded-b-3xl shrink-0">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 border border-gray-200 px-4 py-3 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors bg-gray-50"
              placeholder="상담 내용을 입력하세요..."
            />
            <button
              onClick={sendMessage}
              className="bg-pink-500 text-white px-4 py-3 rounded-2xl hover:bg-pink-600 transition-colors shadow-sm"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-pink-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all relative group"
        >
          <FiMessageCircle size={30} />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-600" />
          </span>
        </button>
      )}
    </div>
  );
}
