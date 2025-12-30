import type { HTMLAttributes } from 'react';
import {
  TankComponentButton,
  type TankComponentButtonProps,
} from './TankComponentButton';

interface GenericTankComponentButtonProps extends TankComponentButtonProps {
  icon: string;
  iconStyles?: HTMLAttributes<HTMLImageElement>['style'];
}

export function GenericTankComponentButton({
  icon,
  iconStyles,
  children,
  ...props
}: GenericTankComponentButtonProps) {
  return (
    <TankComponentButton {...props}>
      <div
        style={{
          width: 48,
          height: 40,
          position: 'relative',
        }}
      >
        <img
          alt={icon}
          draggable={false}
          src={icon}
          style={{
            objectFit: 'contain',
            width: 32,
            height: 32,
            position: 'absolute',
            opacity: props.disabled ? 0.5 : 1,
            transform: 'translate(-50%, -50%) scale(0.75)',
            top: '50%',
            left: '50%',
            ...iconStyles,
          }}
        />
      </div>

      {children}
    </TankComponentButton>
  );
}
