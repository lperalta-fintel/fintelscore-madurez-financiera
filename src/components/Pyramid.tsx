import { PyramidChart } from './PyramidChart';

interface PyramidProps {
  activeLevel: number;
}

export function Pyramid({ activeLevel }: PyramidProps) {
  return <PyramidChart activeLevel={activeLevel} showTooltip={true} animateOnMount={true} />;
}
