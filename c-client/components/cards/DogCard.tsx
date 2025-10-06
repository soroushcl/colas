import Image from "next/image";
import Link from "next/link";

export type DogCardVariant = "profile" | "register" | "add" | "empty";

interface DogCardProps {
  variant: DogCardVariant;
  name?: string;
  href?: string;
  subtitle?: string;
  onRegisterClick?: () => void;
}

export default function DogCard({ variant, name, href, subtitle, onRegisterClick }: DogCardProps) {
  if (variant === "profile") {
  // if (variant === "register") {
    return (
      <div className="w-[162px] h-[88px] md:w-[120px] md:h-[160px] bg-gray_foreground shadow-md border border-gray_divider rounded-2xl flex md:flex-col items-center md:justify-center p-4 pr-2 md:p-2">
        <div className="w-12 h-12 md:w-[64px] md:h-[64px] bg-system_accent rounded-full flex items-center justify-center mr-3 md:mr-0">
          <Image src="/images/dog_avatar_profile.png" alt="Table Dog" width={64} height={64} className='object-contain w-[48px] h-[48px] md:w-[64px] md:h-[64px]' />
        </div>
        <div className="flex-1 md:flex md:flex-col md:justify-evenly md:gap-1">
          {href ? (
            <Link href={href} className="min-w-[66px] h-[32px] bg-system_light_secondary px-3 py-1 rounded-full text-xs font-medium mb-1 flex items-center justify-center">
              <p className="text-system_dark_secondary text-xs font-bold">
                {name ?? "Profile"}
              </p>
              <Image src="/images/chevrons1.png" alt="Table Dog" width={16} height={32} className='object-contain w-[8px] h-[16px]' />
            </Link>
          ) : (
            <div className="min-w-[66px] h-[32px] bg-system_light_secondary px-3 py-1 rounded-full text-xs font-medium mb-1 flex items-center justify-center">
              <p className="text-system_dark_secondary text-xs font-bold">
                {name ?? "Profile"}
              </p>
              <Image src="/images/chevrons1.png" alt="Table Dog" width={16} height={32} className='object-contain w-[8px] h-[16px]' />
            </div>
          )}
          {subtitle ? <p className="text-[10px] text-label_secondary text-center">{subtitle}</p> : null}
        </div>
      </div>
    );
  }

  // if (variant === "profile") {
  if (variant === "register") {
    return (
      <div className="w-[162px] h-[88px] md:w-[120px] md:h-[160px] bg-gray_placeholder shadow-md rounded-2xl flex md:flex-col items-center shadow-xs border border-gray_divider p-4 pr-2">
        <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] bg-system_accent rounded-full flex items-center justify-center mr-3 md:mr-0">
          <Image src="/images/dog_avatar_register.png" alt="Table Dog" width={64} height={64} className='object-contain w-[48px] h-[48px] md:w-[64px] md:h-[64px]' />
        </div>
        <div className="flex-1 flex flex-col justify-center md:justify-end md:gap-1">
          <button onClick={onRegisterClick} className="w-[78px] h-[32px] bg-system_accent px-2 py-1 rounded-full mb-1 border border-gray_divider">
            <div className="flex justify-between items-center">
              <p className="text-system_light_primary text-xs font-bold">
                Register
              </p>
              <Image src="/images/chevrons.png" alt="Table Dog" width={16} height={32} className='object-contain w-[8px] h-[16px]' />
            </div>

          </button>
          <p className="text-[10px] text-label_tertiary text-center">{subtitle ?? "Not Completed"}</p>
        </div>
      </div>
    );
  }

  if (variant === "add") {
    return (
      <div className="w-[162px] h-[88px] md:w-[120px] md:h-[160px] bg-system_accent shadow-md rounded-2xl flex md:flex-col items-center md:text-center justify-center border border-system_light_primary p-4">
        <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] rounded-full flex items-center justify-center mr-3 md:mr-0">
          <Image src="/images/add_dog.png" alt="Table Dog" width={48} height={48} className='object-contain w-[48px] h-[48px] md:w-[64px] md:h-[64px]' />
        </div>
        <div className="flex-1 md:flex md:flex-col-reverse md:justify-start md:gap-1">
          <p className="text-xs md:text-sm font-bold text-system_light_primary mb-1">{name ?? "Add pooch"}</p>
          <p className="text-xs md:text-sm font-normal text-system_light_primary">{subtitle ?? "Up to 4"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[162px] h-[88px] md:w-[120px] md:h-[160px] bg-[url(/images/empty_dog_card.png)] md:bg-[url(/images/empty_dog_card_vertical.png)] rounded-xl flex items-center justify-center p-4">
      <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center -mb-8 md:-mb-[104px]">
        <Image src="/images/empty_dog.png" alt="Table Dog" width={88} height={88} className='object-contain w-[88px] h-[88px]' />
      </div>
    </div>
  );
}
