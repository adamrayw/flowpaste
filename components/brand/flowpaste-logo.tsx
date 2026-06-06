import Image from 'next/image';

type FlowPasteLogoProps = {
  className?: string;
  priority?: boolean;
};

export function FlowPasteLogo({
  className = 'h-8 w-8',
  priority = false,
}: FlowPasteLogoProps) {
  return (
    <Image
      src="/brand/flowpaste-logo.png"
      alt="FlowPaste logo"
      width={128}
      height={128}
      className={className}
      priority={priority}
    />
  );
}
