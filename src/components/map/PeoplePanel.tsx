'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { searchCities } from '@/lib/cities';
import { updateUser } from '@/lib/supabase';
import type { UserEntry, TimePeriod, City } from '@/types';

interface PeoplePanelProps {
  users: UserEntry[];
  period: TimePeriod;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUserUpdated: (updated: UserEntry) => void;
  onFlyTo: (lng: number, lat: number) => void;
  selectedPeople: Set<string>;
  onToggleSelect: (userId: string) => void;
  onClearSelection: () => void;
}

function getLocationForPeriod(user: UserEntry, period: TimePeriod) {
  switch (period) {
    case 'summer':
      return { city: user.summer_city, lat: user.summer_lat, lng: user.summer_lng, activity: user.summer_activity };
    case 'year1':
      return { city: user.year1_city, lat: user.year1_lat, lng: user.year1_lng, activity: user.year1_activity };
    case 'year2':
      return { city: user.year2_city, lat: user.year2_lat, lng: user.year2_lng, activity: user.year2_activity };
  }
}

function getPeriodPrefix(period: TimePeriod): string {
  switch (period) {
    case 'summer': return 'summer';
    case 'year1': return 'year1';
    case 'year2': return 'year2';
  }
}

export default function PeoplePanel({
  users, period, collapsed, onToggleCollapse, onUserUpdated, onFlyTo,
  selectedPeople, onToggleSelect, onClearSelection,
}: PeoplePanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; userId: string } | null>(null);
  const [editActivity, setEditActivity] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [saving, setSaving] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const editCityRef = useRef('');

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    if (contextMenu) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [contextMenu]);

  useEffect(() => {
    if (cityQuery.length > 0) setCityResults(searchCities(cityQuery));
    else setCityResults([]);
  }, [cityQuery]);

  const handleContextMenu = useCallback((e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, userId });
  }, []);

  const startEditing = useCallback((user: UserEntry) => {
    const loc = getLocationForPeriod(user, period);
    setEditingId(user.id!);
    editCityRef.current = loc.city;
    setEditActivity(loc.activity || '');
    setSelectedCity(null);
    setCityQuery('');
    setContextMenu(null);
  }, [period]);

  const handleSave = useCallback(async (user: UserEntry) => {
    if (!user.id) return;
    setSaving(true);
    try {
      const prefix = getPeriodPrefix(period);
      const updates: Record<string, unknown> = {
        id: user.id,
        [`${prefix}_activity`]: editActivity || null,
      };
      if (selectedCity) {
        updates[`${prefix}_city`] = selectedCity.name;
        updates[`${prefix}_lat`] = selectedCity.lat;
        updates[`${prefix}_lng`] = selectedCity.lng;
      }
      const updated = await updateUser(updates as Parameters<typeof updateUser>[0]);
      onUserUpdated(updated);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setSaving(false);
    }
  }, [period, editActivity, selectedCity, onUserUpdated]);

  const handleCardClick = useCallback((user: UserEntry) => {
    const loc = getLocationForPeriod(user, period);
    onFlyTo(loc.lng, loc.lat);
  }, [period, onFlyTo]);

  const hasSelection = selectedPeople.size > 0;

  return (
    <>
      {/* Panel */}
      <div
        className="absolute top-0 left-0 h-full z-30"
        style={{
          width: 320,
          transform: collapsed ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="h-full flex flex-col bg-[#f0e8de]/95 backdrop-blur-xl border-r border-[#2B2B23]/8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2
              className="text-lg tracking-tight"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
            >
              People
            </h2>
            <button
              onClick={onToggleCollapse}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2B2B23]/6 active:scale-90 transition-all duration-200 text-[#2B2B23]/40 hover:text-[#2B2B23]/70"
              style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 2L4 7L9 12" />
              </svg>
            </button>
          </div>

          {/* Count + unselect button */}
          <div className="px-5 pb-3 flex items-center justify-between">
            <span className="text-xs text-[#2B2B23]/35 tracking-wide">
              {hasSelection
                ? `${selectedPeople.size} selected`
                : `${users.length} ${users.length === 1 ? 'person' : 'people'}`}
            </span>
            {hasSelection && (
              <button
                onClick={onClearSelection}
                className="text-[10px] uppercase tracking-wider text-[#d44a3a]/60 hover:text-[#d44a3a] transition-all duration-200 font-medium active:scale-95"
              >
                Unselect All
              </button>
            )}
          </div>

          <div className="mx-5 border-t border-[#2B2B23]/6" />

          {/* People list */}
          <div className="flex-1 overflow-y-auto px-2.5 py-2 scroll-smooth">
            {users.map((user, index) => {
              const loc = getLocationForPeriod(user, period);
              const isEditing = editingId === user.id;
              const isSelected = selectedPeople.has(user.id!);
              const isDimmed = hasSelection && !isSelected;

              return (
                <div
                  key={user.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 40}ms` }}
                ><div
                  className={`group/item rounded-2xl px-3 py-3 mb-1 transition-all duration-300 ${
                    isEditing ? 'bg-white/70 shadow-sm' : 'cursor-pointer hover:bg-white/50 hover:shadow-sm active:scale-[0.98]'
                  }`}
                  style={{
                    opacity: isDimmed ? 0.35 : 1,
                    transform: isDimmed ? 'scale(0.97)' : 'scale(1)',
                    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  onClick={() => {
                    if (!isEditing) handleCardClick(user);
                  }}
                  onContextMenu={(e) => handleContextMenu(e, user.id!)}
                >
                  {isEditing ? (
                    <div className="space-y-3 animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold"
                          style={{ backgroundColor: user.node_color, boxShadow: `0 0 16px ${user.node_color}40` }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-[#2B2B23]">{user.name}</span>
                          <p className="text-[10px] text-[#2B2B23]/40">Editing profile</p>
                        </div>
                      </div>

                      <div className="relative">
                        <label className="text-[10px] uppercase tracking-wider text-[#2B2B23]/40 mb-1.5 block">Location</label>
                        {selectedCity ? (
                          <div className="flex items-center gap-2 text-sm py-1">
                            <span>{selectedCity.name}, {selectedCity.country}</span>
                            <button onClick={() => setSelectedCity(null)} className="text-[#2B2B23]/40 hover:text-[#2B2B23]">×</button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="text"
                              value={cityQuery}
                              onChange={(e) => setCityQuery(e.target.value)}
                              placeholder={editCityRef.current || 'Search city...'}
                              className="w-full rounded-xl border border-[#2B2B23]/10 bg-white/90 px-3 py-2 text-sm placeholder:text-[#2B2B23]/30 focus:outline-none focus:border-[#2B2B23]/20 focus:shadow-sm transition-all duration-200"
                            />
                            {cityResults.length > 0 && (
                              <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#2B2B23]/10 bg-white shadow-lg max-h-40 overflow-y-auto">
                                {cityResults.map((city) => (
                                  <button
                                    key={`${city.name}-${city.country}`}
                                    onClick={() => { setSelectedCity(city); setCityQuery(''); setCityResults([]); }}
                                    className="w-full px-2.5 py-1.5 text-left text-sm hover:bg-[#2B2B23]/5"
                                  >
                                    <span className="font-medium">{city.name}</span>
                                    <span className="ml-1 text-[#2B2B23]/40">{city.country}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-[#2B2B23]/40 mb-1.5 block">Activity</label>
                        <select
                          value={editActivity}
                          onChange={(e) => setEditActivity(e.target.value)}
                          className="w-full rounded-xl border border-[#2B2B23]/10 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:border-[#2B2B23]/20 focus:shadow-sm appearance-none transition-all duration-200"
                        >
                          <option value="">None</option>
                          <option value="Internship">Internship</option>
                          <option value="Full Time">Full Time</option>
                          <option value="Coterm">Coterm</option>
                          <option value="Gap Year">Gap Year</option>
                          <option value="Grad School">Grad School</option>
                          <option value="Undergrad">Undergrad</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleSave(user)}
                          disabled={saving}
                          className="flex-1 rounded-xl bg-[#2B2B23] text-[#f0e8de] py-2 text-xs font-medium hover:bg-[#2B2B23]/90 active:scale-[0.97] disabled:opacity-50 transition-all duration-200"
                          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                        >
                          {saving ? 'Saving...' : 'Done'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 rounded-xl border border-[#2B2B23]/10 py-2 text-xs text-[#2B2B23]/50 hover:text-[#2B2B23]/80 hover:border-[#2B2B23]/20 active:scale-[0.97] transition-all duration-200"
                          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Selection checkbox - visible on hover or when selected */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(user.id!);
                        }}
                        className="w-[18px] h-[18px] rounded-md border flex-shrink-0 flex items-center justify-center active:scale-75"
                        style={{
                          backgroundColor: isSelected ? '#2B2B23' : 'transparent',
                          borderColor: isSelected ? '#2B2B23' : 'rgba(43,43,35,0.15)',
                          opacity: isSelected ? 1 : undefined,
                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="animate-pop-in">
                            <path d="M2 5L4.5 7.5L8 3" />
                          </svg>
                        )}
                      </button>

                      <div
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold transition-shadow duration-300"
                        style={{
                          backgroundColor: user.node_color,
                          boxShadow: `0 2px 8px ${user.node_color}25`,
                        }}
                        onMouseEnter={(e) => { (e.currentTarget).style.boxShadow = `0 0 0 4px ${user.node_color}18, 0 4px 16px ${user.node_color}35`; }}
                        onMouseLeave={(e) => { (e.currentTarget).style.boxShadow = `0 2px 8px ${user.node_color}25`; }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#2B2B23] truncate">{user.name}</div>
                        <div className="text-xs text-[#2B2B23]/45 truncate">
                          {loc.city}{loc.activity ? ` · ${loc.activity}` : ''}
                        </div>
                      </div>
                    </div>
                  )}
                </div></div>
              );
            })}

            {users.length === 0 && (
              <div className="px-3 py-8 text-center text-xs text-[#2B2B23]/25 animate-fade-in">
                No entries yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapse toggle */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="absolute top-4 left-4 z-30 w-11 h-11 rounded-full bg-[#f0e8de]/92 backdrop-blur-md border border-[#2B2B23]/8 shadow-lg flex items-center justify-center hover:shadow-xl active:scale-90 transition-all duration-300 text-[#2B2B23]/50 hover:text-[#2B2B23]/80 animate-pop-in"
          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 3L11 8L6 13" />
          </svg>
        </button>
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 rounded-2xl bg-white/96 backdrop-blur-xl border border-[#2B2B23]/8 shadow-2xl py-1.5 min-w-[170px] animate-fade-in-scale"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              const user = users.find((u) => u.id === contextMenu.userId);
              if (user) startEditing(user);
            }}
            className="w-full px-4 py-2.5 text-left text-[13px] text-[#2B2B23] hover:bg-[#2B2B23]/4 active:bg-[#2B2B23]/8 transition-all duration-150 flex items-center gap-2.5 rounded-xl"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 2.5l3 3M1.5 9.5l6-6 3 3-6 6H1.5v-3z" />
            </svg>
            Edit Profile
          </button>
        </div>
      )}
    </>
  );
}
