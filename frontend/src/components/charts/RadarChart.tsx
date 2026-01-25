import { memo } from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

const ESG_COLORS = {
  environment: '#10b981',
  social: '#3b82f6',
  governance: '#8b5cf6',
};

interface RadarConfig {
  key: string;
  name: string;
  color?: string;
  fillOpacity?: number;
}

interface RadarChartProps {
  data: Array<Record<string, unknown>>;
  radars: RadarConfig[];
  angleKey: string;
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
  domain?: [number, number];
}

// Custom tooltip
const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      {payload.map((entry, index) => (
        <p key={index} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
});

function RadarChart({
  data,
  radars,
  angleKey,
  title,
  description,
  height = 300,
  showLegend = true,
  showGrid = true,
  className,
  domain = [0, 100],
}: RadarChartProps) {
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        {showGrid && <PolarGrid className="stroke-muted" />}
        <PolarAngleAxis
          dataKey={angleKey}
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <PolarRadiusAxis
          angle={30}
          domain={domain}
          tick={{ fontSize: 10 }}
          className="text-muted-foreground"
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        {radars.map((radar) => (
          <Radar
            key={radar.key}
            name={radar.name}
            dataKey={radar.key}
            stroke={radar.color || ESG_COLORS.environment}
            fill={radar.color || ESG_COLORS.environment}
            fillOpacity={radar.fillOpacity ?? 0.3}
            strokeWidth={2}
          />
        ))}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );

  if (!title) {
    return <div className={cn('w-full', className)}>{chartContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pb-4">{chartContent}</CardContent>
    </Card>
  );
}

export default memo(RadarChart);
