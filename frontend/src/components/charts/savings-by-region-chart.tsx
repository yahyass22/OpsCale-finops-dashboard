"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils";
import { MapPin, Building2, TrendingUp, Globe } from "lucide-react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapControls,
} from "@/components/ui/map";

interface RegionData {
  region: string;
  savings: number;
  workloads: number;
  growth: number;
}

interface Props {
  data: RegionData[];
}

const REGION_COLORS: Record<string, string> = {
  "N. America": "#1d5fd1",
  Europe: "#159a74",
  "Asia Pacific": "#808BC5",
  "Latin America": "#EAC119",
  "Middle East": "#c88116",
  Africa: "#c44949",
};

// GeoJSON requires [lng, lat] for MapLibre
const REGION_COORDS: Record<string, [number, number]> = {
  "N. America": [-100, 42],
  Europe: [10, 50],
  "Asia Pacific": [125, -15],
  "Latin America": [-60, -10],
  "Middle East": [45, 24],
  Africa: [20, -5],
};

export function SavingsByRegionChart({ data }: Props) {
  const totalSavings = data.reduce((s, d) => s + d.savings, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Projected TCO Savings Distribution
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Global regional breakdown — hover markers for details
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">
            {data.length} regions
          </span>
        </div>
      </div>

      {/* Full-width map — seamless, no border */}
      <div className="w-full h-[480px] rounded-xl overflow-hidden">
        <Map
          center={[10, 10]}
          zoom={1}
          minZoom={0.8}
          maxZoom={8}
          theme="light"
          className="w-full h-full"
        >
          {/* Zoom in/out controls */}
          <MapControls
            position="top-right"
            showZoom
            showCompass={false}
            showFullscreen
          />

          {data.map((d) => {
            const coords = REGION_COORDS[d.region];
            if (!coords) return null;
            const color = REGION_COLORS[d.region] || "#1d5fd1";
            const pct =
              totalSavings > 0 ? (d.savings / totalSavings) * 100 : 0;
            const dotSize = Math.max(36, Math.min(72, 36 + (pct / 100) * 36));
            return (
              <MapMarker
                key={d.region}
                longitude={coords[0]}
                latitude={coords[1]}
              >
                <MarkerContent>
                  <div
                    className="rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center group-hover:scale-110"
                    style={{
                      background: color,
                      width: dotSize,
                      height: dotSize,
                      opacity: 0.5,
                      boxShadow: `0 6px 24px ${color}50`,
                    }}
                  >
                    <span className="text-white text-xs font-bold drop-shadow-sm">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </MarkerContent>
                {/* Rich hover tooltip — no click needed */}
                <MarkerTooltip className="bg-white text-gray-900 shadow-lg rounded-lg border border-gray-200 p-0">
                  <div className="px-3 py-2.5 space-y-2 min-w-[180px]">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-gray-200">
                      <Globe className="w-3.5 h-3.5" style={{ color }} />
                      <p className="text-xs font-semibold text-gray-900">
                        {d.region}
                      </p>
                      <span
                        className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: color }}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-chart-local" />
                        <div>
                          <p className="text-[9px] text-gray-500 leading-none">
                            Savings
                          </p>
                          <p className="text-[11px] font-semibold text-gray-900 mt-0.5">
                            {formatMoney(d.savings)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-chart-cloud" />
                        <div>
                          <p className="text-[9px] text-gray-500 leading-none">
                            Workloads
                          </p>
                          <p className="text-[11px] font-semibold text-gray-900 mt-0.5">
                            {d.workloads}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-gray-200">
                      <span className="text-[9px] text-gray-500">
                        YoY Growth:
                      </span>
                      <span className="text-[10px] font-semibold text-chart-local">
                        +{d.growth}%
                      </span>
                    </div>
                  </div>
                </MarkerTooltip>
              </MapMarker>
            );
          })}
        </Map>
      </div>
    </div>
  );
}
