import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  titleEn,
  description,
  descriptionEn,
  icon: Icon,
  onClick,
  isActive = false,
  className
}) => {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-feature cursor-pointer group",
      isActive && "ring-2 ring-primary shadow-glow bg-gradient-card",
      className
    )}>
      <Button
        onClick={onClick}
        variant="ghost"
        className="w-full h-full p-0 hover:bg-transparent"
      >
        <div className="p-6 text-right w-full space-y-4">
          <div className="flex justify-between items-center">
            <Icon className={cn(
              "h-8 w-8 transition-colors duration-300",
              isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
            )} />
            <div className="text-right flex-1 mr-4">
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {titleEn}
              </p>
            </div>
          </div>
          
          <div className="space-y-2 text-right">
            <p className="text-sm leading-relaxed">
              {description}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {descriptionEn}
            </p>
          </div>
        </div>
      </Button>
    </Card>
  );
};