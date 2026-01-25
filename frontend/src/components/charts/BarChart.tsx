import { memo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

// Custom colors for ESG
const ESG_COLORS = {
  environment: '#10b981', // Green
  social: '#3b82f6', // Blue
  governance: '#8b5cf6', // Purple
  risk: '#ef4444', // Red
  primary: '#0ea5e9', // Sky blue
  secondary: '#6b7280', // Gray
};

const RISK_COLORS = ['#10b981', '#22c55e', '#eab308', '#f97316', '#ef4444'];

interface BarChartProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  xAxisKey: string;
  title?: string;
  description?: string;
  color?: string;
  colorByValue?: boolean;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
  formatLabel?: (value: number) => string;
  formatTooltip?: (value: number) => string;
}

// Custom tooltip component
const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  formatValue?: (value: number) => string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-muted-foreground">
          <span style={{ color: entry.color }}>●</span>{' '}
          {entry.name}: {formatValue ? formatValue(entry.value) : entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
});

function BarChart({
  data,
  dataKey,
  xAxisKey,
  title,
  description,
  color = ESG_COLORS.primary,
  colorByValue = false,
  height = 300,
  showLegend = false,
  showGrid = true,
  className,
  formatLabel,
  formatTooltip,
}: BarChartProps) {
  const getBarColor = (value: number) => {
    if (!colorByValue) return color;
    // Color based on value range (0-100)
    if (value <= 20) return RISK_COLORS[4]; // Red - High risk
    if (value <= 40) return RISK_COLORS[3]; // Orange
    if (value <= 60) return RISK_COLORS[2]; // Yellow
    if (value <= 80) return RISK_COLORS[1]; // Light green
    return RISK_COLORS[0]; // Green - Low risk
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatLabel}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <Tooltip
          content={<CustomTooltip formatValue={formatTooltip} />}
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
        />
        {showLegend && <Legend />}
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} maxBarSize={50}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getBarColor(entry[dataKey] as number)}
            />
          ))}
        </Bar>
      </RechartsBarChart>
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

export default memo(BarChart);
