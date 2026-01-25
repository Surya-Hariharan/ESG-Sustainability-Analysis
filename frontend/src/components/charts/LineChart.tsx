import { memo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

const ESG_COLORS = {
  environment: '#10b981',
  social: '#3b82f6',
  governance: '#8b5cf6',
  primary: '#0ea5e9',
};

interface LineConfig {
  key: string;
  name: string;
  color?: string;
  strokeDasharray?: string;
}

interface LineChartProps {
  data: Array<Record<string, unknown>>;
  lines: LineConfig[];
  xAxisKey: string;
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showDots?: boolean;
  curved?: boolean;
  className?: string;
  formatXAxis?: (value: string | number) => string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
}

// Custom tooltip
const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatValue?: (value: number) => string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {formatValue ? formatValue(entry.value) : entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
});

function LineChart({
  data,
  lines,
  xAxisKey,
  title,
  description,
  height = 300,
  showLegend = true,
  showGrid = true,
  showDots = true,
  curved = true,
  className,
  formatXAxis,
  formatYAxis,
  formatTooltip,
}: LineChartProps) {
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatXAxis}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatYAxis}
          className="text-muted-foreground"
        />
        <Tooltip content={<CustomTooltip formatValue={formatTooltip} />} />
        {showLegend && <Legend />}
        {lines.map((line) => (
          <Line
            key={line.key}
            type={curved ? 'monotone' : 'linear'}
            dataKey={line.key}
            name={line.name}
            stroke={line.color || ESG_COLORS.primary}
            strokeWidth={2}
            dot={showDots ? { r: 3 } : false}
            activeDot={{ r: 5 }}
            strokeDasharray={line.strokeDasharray}
          />
        ))}
      </RechartsLineChart>
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

export default memo(LineChart);
