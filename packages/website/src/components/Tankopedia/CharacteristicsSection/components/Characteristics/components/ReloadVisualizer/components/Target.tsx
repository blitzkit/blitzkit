import { Box } from '@radix-ui/themes';

export function Target() {
  return (
    <Box
      style={{
        background:
          'url(/media/toys/background.jpg)',
        backgroundSize: '25rem',
        backgroundPosition: 'center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'blur(0.2rem) contrast(1.2) brightness(0.5) saturate(0.8)',
      }}
    />
  );
}
