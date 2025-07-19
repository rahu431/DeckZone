import React from 'react';
import { Label } from '@/components/ui/Label';
import { Slider } from '@/components/ui/Slider';

interface MicSensitivitySliderProps {
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
}

const MicSensitivitySlider: React.FC<MicSensitivitySliderProps> = ({ sensitivity, onSensitivityChange }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="mic-sensitivity">Mic Sensitivity</Label>
      <Slider
        id="mic-sensitivity"
        min={0}
        max={100}
        step={1}
        value={[sensitivity]}
        onValueChange={(value) => onSensitivityChange(value[0])}
      />
      <p className="text-sm text-muted-foreground">
        Adjust to reduce background noise. Higher values are less sensitive.
      </p>
    </div>
  );
};

export default MicSensitivitySlider;