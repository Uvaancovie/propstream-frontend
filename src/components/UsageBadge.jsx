import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * UsageBadge - Displays usage stats with upgrade CTA at ≥80%
 * @param {number} used - Current usage count
 * @param {number} limit - Maximum allowed
 * @param {string} label - Resource name (e.g., "AI Generations", "Newsletters")
 * @param {boolean} compact - Show compact version
 */
const UsageBadge = ({ used = 0, limit = 0, label = "Usage", compact = false }) => {
  const navigate = useNavigate();
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= limit;

  const getVariant = () => {
    if (isAtLimit) return "destructive";
    if (isNearLimit) return "warning";
    return "secondary";
  };

  const getBgColor = () => {
    if (isAtLimit) return "bg-red-50 border-red-200";
    if (isNearLimit) return "bg-yellow-50 border-yellow-200";
    return "bg-violet-50 border-violet-200";
  };

  const getTextColor = () => {
    if (isAtLimit) return "text-red-700";
    if (isNearLimit) return "text-yellow-700";
    return "text-violet-700";
  };

  const getProgressColor = () => {
    if (isAtLimit) return "bg-red-600";
    if (isNearLimit) return "bg-yellow-600";
    return "bg-violet-600";
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <Badge variant={getVariant()} className="font-mono">
          {used} / {limit}
        </Badge>
        {isNearLimit && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/billing?intent=upgrade&reason=limit')}
            className="h-6 px-2 text-xs"
          >
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${getBgColor()}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className={`text-sm font-medium ${getTextColor()}`}>{label}</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>
            {used} <span className="text-base font-normal">/ {limit}</span>
          </p>
        </div>
        {isAtLimit && (
          <AlertCircle className={`w-5 h-5 ${getTextColor()}`} />
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/50 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* CTA */}
      {isNearLimit && (
        <div className="flex items-center justify-between">
          <p className={`text-xs ${getTextColor()}`}>
            {isAtLimit ? 'Limit reached' : 'Approaching limit'}
          </p>
          <Button
            size="sm"
            variant={isAtLimit ? "destructive" : "secondary"}
            onClick={() => navigate('/billing?intent=upgrade&reason=limit')}
            className="h-8 text-xs"
          >
            {isAtLimit ? 'Upgrade Now' : 'Upgrade Plan'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UsageBadge;
