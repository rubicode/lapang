'use client';

import React, { useEffect, useRef } from 'react';
import { Maximize } from 'lucide-react';
import { Venue } from '@/types';

interface LeafletMapProps {
  venues: Venue[];
  activeVenueId?: string | null;
  onSelectVenue: (venue: Venue) => void;
  onResetToIndonesia: () => void;
  centerCoords?: [number, number];
  zoomLevel?: number;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  venues,
  onSelectVenue,
  centerCoords = [-6.2088, 106.8456],
  zoomLevel = 12
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Dynamically load leaflet on client-side only
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: false
        }).setView(centerCoords, zoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;

      if (markersLayer) {
        markersLayer.clearLayers();

        venues.forEach((venue) => {
          const rawLat = venue.lat ?? (venue as any).latitude;
          const rawLng = venue.lng ?? (venue as any).longitude;
          const lat = typeof rawLat === 'number' ? rawLat : parseFloat(rawLat);
          const lng = typeof rawLng === 'number' ? rawLng : parseFloat(rawLng);

          if (isNaN(lat) || isNaN(lng)) return;

          let pinColor = '#1B5E20';
          if (venue.sport === 'badminton') pinColor = '#f59e0b';
          if (venue.sport === 'basketball') pinColor = '#ea580c';
          if (venue.sport === 'padel') pinColor = '#2563eb';
          if (venue.sport === 'volleyball') pinColor = '#059669';

          const html = `
            <div class="custom-pin relative flex flex-col items-center cursor-pointer">
              <div style="background-color: ${pinColor};" class="w-10 h-10 rounded-2xl shadow-xl flex items-center justify-center text-white border-2 border-white ring-2 ring-black/10">
                <span class="text-base">${venue.sportIcon}</span>
              </div>
              <div style="border-top-color: ${pinColor};" class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]"></div>
              <div class="bg-slate-900/90 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md mt-0.5 whitespace-nowrap">
                ${venue.priceFormatted}
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'leaflet-custom-marker',
            html: html,
            iconSize: [44, 58],
            iconAnchor: [22, 54],
            popupAnchor: [0, -50]
          });

          const marker = L.marker([lat, lng], { icon: customIcon });

          const popupContent = `
            <div class="w-64 bg-white overflow-hidden text-left font-sans">
              <div class="h-28 w-full relative">
                <img src="${venue.mainImage}" alt="${venue.name}" class="w-full h-full object-cover">
                <span class="absolute top-2 right-2 bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  ★ ${venue.rating}
                </span>
              </div>
              <div class="p-3">
                <div class="flex items-center gap-1 text-[11px] font-bold text-emerald-800 mb-1">
                  <span>${venue.sportIcon}</span>
                  <span>${venue.sportName}</span>
                </div>
                <h4 class="font-extrabold text-slate-900 text-xs mb-1 line-clamp-1">${venue.name}</h4>
                <p class="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
                  📍 ${venue.city} • ${venue.distance || `${venue.distanceKm} km`}
                </p>
                <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span class="font-black text-emerald-800 text-xs">${venue.priceFormatted}<span class="text-[10px] text-slate-400 font-normal">/jam</span></span>
                  <button id="btn-popup-${venue.id}" class="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold rounded-lg transition cursor-pointer">
                    Detail & Slot
                  </button>
                </div>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, { className: 'custom-popup' });

          marker.on('popupopen', () => {
            const popupBtn = document.getElementById(`btn-popup-${venue.id}`);
            if (popupBtn) {
              popupBtn.onclick = () => {
                onSelectVenue(venue);
              };
            }
          });

          marker.on('click', () => {
            const cardEl = document.getElementById(`card-${venue.id}`);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              cardEl.classList.add('ring-2', 'ring-emerald-800', 'bg-emerald-50/40');
              setTimeout(() => {
                cardEl.classList.remove('ring-2', 'ring-emerald-800', 'bg-emerald-50/40');
              }, 1600);
            }
          });

          markersLayer.addLayer(marker);
        });

        if (venues.length > 0) {
          const group = L.featureGroup(markersLayer.getLayers());
          map.fitBounds(group.getBounds().pad(0.2));
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [venues, onSelectVenue]);

  const handleResetIndonesia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-2.5489, 118.0149], 5);
    }
  };

  return (
    <section className="flex-1 h-full relative bg-slate-200 overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls / Overlay Badges */}
      <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-gray-200/80 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-800 animate-ping"></span>
            <span className="text-xs font-bold text-slate-800">GPS Live Sync</span>
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-slate-500">Geser peta untuk perbarui list</span>
        </div>
      </div>

      {/* Map Layer Legend (Jenis Lapangan) */}
      <div className="absolute bottom-6 left-4 z-[500] bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200 text-xs hidden sm:block">
        <p className="font-bold text-slate-800 mb-1.5">Keterangan Pin Peta:</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Futsal/Sepak Bola
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Badminton
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span> Bola Basket
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Tenis &amp; Padel
          </div>
        </div>
      </div>

      {/* Recenter to Indonesia Button */}
      <button
        onClick={handleResetIndonesia}
        className="absolute bottom-6 right-4 z-[500] bg-white text-slate-800 p-2.5 rounded-xl shadow-lg border border-gray-200 hover:bg-brand-50 hover:text-brand-800 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        title="Reset Tampilan Seluruh Indonesia"
      >
        <Maximize className="w-4 h-4 text-brand-800" />
        <span className="hidden md:inline">Lihat Peta Indonesia</span>
      </button>
    </section>
  );
};
