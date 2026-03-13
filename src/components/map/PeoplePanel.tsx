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

export default function PeoplePanel({ users, period, collapsed, onToggleCollapse, onUserUpdated, onFlyTo }: PeoplePanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; userId: string } | null>(null);
  const [editCity, setEditCity] = useState('');
  const [editActivity, setEditActivity] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [saving, setSaving] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
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

  // City search
  useEffect(() => {
    if (cityQuery.length > 0) {
      setCityResults(searchCities(cityQuery));
    } else {
      setCityResults([]);
    }
  }, [cityQuery]);

  const handleContextMenu = useCallback((e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, userId });
  }, []);

  const startEditing = useCallback((user: UserEntry) => {
    const loc = getLocationForPeriod(user, period);
    setEditingId(user.id!);
    setEditCity(loc.city);
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

  return (
    <>
      {/* Panel */}
      <div
        className={`absolute top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{ width: 320 }}
      >
        <div className="h-full flex flex-col bg-[#f5f0eb]/95 backdrop-blur-lg border-r border-[#2B2B23]/10 shadow-xl">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 pt-5 pb-3">
            <h2
              className="text-lg tracking-tight"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
            >
              People
            </h2>
            <button
              onClick={onToggleCollapse}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#2B2B23]/8 transition-colors text-[#2B2B23]/50 hover:text-[#2B2B23]"
              title="Close panel"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 2L4 7L9 12" />
              </svg>
            </button>
          </div>

          {/* User count */}
          <div className="px-4 pb-3">
            <span className="text-xs text-[#2B2B23]/40 tracking-wide">
              {users.length} {users.length === 1 ? 'person' : 'people'}
            </span>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-[#2B2B23]/8" />

          {/* People list */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {users.map((user) => {
              const loc = getLocationForPeriod(user, period);
              const isEditing = editingId === user.id;

              return (
                <div
                  key={user.id}
                  className={`group rounded-xl px-3 py-3 mb-0.5 cursor-pointer transition-colors ${
                    isEditing ? 'bg-white/60' : 'hover:bg-white/40'
                  }`}
                  onClick={() => !isEditing && handleCardClick(user)}
                  onContextMenu={(e) => handleContextMenu(e, user.id!)}
                >
                  {isEditing ? (
                    /* Edit mode */
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: user.node_color }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[#2B2B23]">{user.name}</span>
                      </div>

                      {/* City selector */}
                      <div className="relative">
                        <label className="text-[10px] uppercase tracking-wider text-[#2B2B23]/40 mb-1 block">City</label>
                        {selectedCity ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span>{selectedCity.name}, {selectedCity.country}</span>
                            <button
                              onClick={() => setSelectedCity(null)}
                              className="text-[#2B2B23]/40 hover:text-[#2B2B23]"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="text"
                              value={cityQuery}
                              onChange={(e) => setCityQuery(e.target.value)}
                              placeholder={editCity || 'Search city...'}
                              className="w-full rounded-lg border border-[#2B2B23]/15 bg-white/80 px-2.5 py-1.5 text-sm placeholder:text-[#2B2B23]/30 focus:outline-none focus:border-[#2B2B23]/30"
                            />
                            {cityResults.length > 0 && (
                              <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#2B2B23]/10 bg-white shadow-lg max-h-40 overflow-y-auto">
                                {cityResults.map((city) => (
                                  <button
                                    key={`${city.name}-${city.country}`}
                                    onClick={() => {
                                      setSelectedCity(city);
                                      setCityQuery('');
                                      setCityResults([]);
                                    }}
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

                      {/* Activity */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-[#2B2B23]/40 mb-1 block">Activity</label>
                        <select
                          value={editActivity}
                          onChange={(e) => setEditActivity(e.target.value)}
                          className="w-full rounded-lg border border-[#2B2B23]/15 bg-white/80 px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#2B2B23]/30"
                        >
                          <option value="">None</option>
                          <option value="Internship">Internship</option>
                          <option value="Full Time">Full Time</option>
                          <option value="Coterm">Coterm</option>
                          <option value="Gap Year">Gap Year</option>
                          <option value="Premed">Premed</option>
                          <option value="Undergrad">Undergrad</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Save/Cancel */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(user)}
                          disabled={saving}
                          className="flex-1 rounded-lg bg-[#2B2B23] text-[#f5f0eb] py-1.5 text-xs font-medium hover:bg-[#2B2B23]/90 disabled:opacity-50 transition-colors"
                        >
                          {saving ? 'Saving...' : 'Done'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 rounded-lg border border-[#2B2B23]/15 py-1.5 text-xs text-[#2B2B23]/60 hover:text-[#2B2B23] hover:border-[#2B2B23]/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal view */
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium shadow-sm"
                        style={{ backgroundColor: user.node_color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#2B2B23] truncate">{user.name}</div>
                        <div className="text-xs text-[#2B2B23]/50 truncate">
                          {loc.city}{loc.activity ? ` · ${loc.activity}` : ''}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {users.length === 0 && (
              <div className="px-3 py-8 text-center text-xs text-[#2B2B23]/30">
                No entries yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapse toggle button (visible when panel is collapsed) */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-[#f5f0eb]/90 backdrop-blur-sm border border-[#2B2B23]/10 shadow-lg flex items-center justify-center hover:bg-white/90 transition-colors text-[#2B2B23]/60 hover:text-[#2B2B23]"
          title="Open people panel"
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
          className="fixed z-50 rounded-xl bg-white/95 backdrop-blur-lg border border-[#2B2B23]/10 shadow-xl py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              const user = users.find((u) => u.id === contextMenu.userId);
              if (user) startEditing(user);
            }}
            className="w-full px-4 py-2 text-left text-sm text-[#2B2B23] hover:bg-[#2B2B23]/5 transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 2.5l3 3M1.5 9.5l6-6 3 3-6 6H1.5v-3z" />
            </svg>
            Edit
          </button>
        </div>
      )}
    </>
  );
}
